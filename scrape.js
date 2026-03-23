const fs = require('fs');
const axios = require('axios');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function streamScrape() {
    const baseUrl = "https://api.jikan.moe/v4/anime";
    let page = 1;
    let hasNextPage = true;
    let isFirstItem = true;

    console.log("Starting memory-efficient Jikan stream... RAM is safe!");

    // 1. Open a writable stream. This pipes data directly to your disk.
    const fileStream = fs.createWriteStream('jikan_full_dump.json', { flags: 'w', encoding: 'utf8' });
    
    // 2. Start the JSON array manually
    fileStream.write('[\n');

    while (hasNextPage) {
        try {
            const response = await axios.get(`${baseUrl}?page=${page}`, {
                validateStatus: (status) => status < 500 
            });

            if (response.status === 200) {
                const pageData = response.data.data || [];
                const totalPages = response.data.pagination?.last_visible_page || "?";
                
                console.log(`Writing page ${page} of ${totalPages} to disk...`);

                // 3. Write each anime to the file immediately
                for (const anime of pageData) {
                    if (!isFirstItem) {
                        fileStream.write(',\n'); // Add comma between objects
                    }
                    fileStream.write(JSON.stringify(anime, null, 2));
                    isFirstItem = false;
                }

                hasNextPage = response.data.pagination?.has_next_page || false;
                page++;

                // Respect the rate limit
                await sleep(1500);

            } else if (response.status === 429) {
                console.log("⚠️ Rate limit hit! Backing off for 10 seconds...");
                await sleep(10000); 
            } else {
                console.error(`❌ API Error ${response.status} on page ${page}. Breaking loop.`);
                break;
            }

        } catch (error) {
            console.error(`Network Error: ${error.message}`);
            break; 
        }
    }

    // 4. Close the JSON array and close the file stream properly
    fileStream.write('\n]');
    fileStream.end();
    console.log("✅ Scrape finished! File stream closed and saved.");
}

streamScrape();