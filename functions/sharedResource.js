import { Mutex } from 'async-mutex';
import fs from 'fs';

class SharedResource {
    constructor() {
        this.mutex = new Mutex();
        this.logMutex = new Mutex();
        this.writeMutex = new Mutex();
        this.data = {}; // Shared resource as an object
    }
    async writeData(batch) {
        this.writeMutex
            .runExclusive(() => {
                fs.appendFileSync('cleanData.csv', batch.join('\n') + `\n`);
            })
            .catch((err) => console.error(err));
    }
    async writeHeaders() {
        this.writeMutex
            .runExclusive(async () => {
                const readFile = fs.readFileSync('cleanData.csv', (err) => {
                    if (err) {
                        throw err;
                    }
                });
                if (readFile.length === 0) {
                    fs.appendFileSync(
                        'cleanData.csv',
                        `#group,false,false,false,false,true,true
#datatype,string,long,dateTime:RFC3339,double,string,string
#default,_result,,,,,hourlyData
,result,table,_time,_value,_field,_measurement
`
                    );
                }
            })
            .catch((err) => console.error(err));
    }
    async logError(message) {
        this.logMutex
            .runExclusive(() => {
                fs.appendFileSync('logfile.log', `${new Date().toISOString()}: ${message}\n`);
            })
            .catch((err) => console.error(err));
    }

    async addKeyValue(key, value) {
        const release = await this.mutex.acquire();
        try {
            // Add or update the key-value pair
            this.data[key] = value;
            // console.log(`Added/Updated: ${key} = ${value}`);
        } finally {
            release();
        }
    }

    async getValue(key) {
        const release = await this.mutex.acquire();
        try {
            // Return the value associated with the key
            return this.data[key];
        } finally {
            release();
        }
    }

    async getAll() {
        const release = await this.mutex.acquire();
        try {
            // Return the entire object
            return { ...this.data }; // Return a shallow copy
        } finally {
            release();
        }
    }
    async getTagKey(tagNameDescription) {
        const release = await this.mutex.acquire();
        try {
            return this.data[tagNameDescription];
        } finally {
            release();
        }
    }
    async setTagKeyData(data) {
        const release = await this.mutex.acquire();
        try {
            this.data = data;
        } finally {
            release();
        }
    }
}

const sharedResource = new SharedResource();
export default sharedResource;
