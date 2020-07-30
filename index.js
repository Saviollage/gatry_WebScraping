const URL = `https://gatry.com/`;
const { Builder, By } = require('selenium-webdriver');
const { Options } = require('selenium-webdriver/chrome');
const { MongoClient } = require('mongodb');
require('chromedriver');


class Item {
    constructor(text, value) {
        this.text = text;
        this.value = value;
    }
}


async function connect() {
    const connection = await MongoClient.connect('mongodb://localhost:27017', {
        useUnifiedTopology: true,
        useNewUrlParser: true
    });
    const collection = await connection.db('gatry').collection('sales');
    return collection;
}
async function main() {
    const sales = await connect();
    let options = new Options();
    options.addArguments('headless')
    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).
        build();

    try {
        await driver.get(URL);
        const results = [];

        await driver.findElement(By.className('carregar-mais carregar-mais-promocoes')).click();

        for (var i = 0; i < 10; i++) {
            console.log('CLick...');

            await new Promise((resolve => {
                setTimeout(resolve, 1000);
            }));

            await driver.executeScript("arguments[0].scrollIntoView()", driver.findElement(By.className('carregar-mais carregar-mais-promocoes')));
        }

        const list = await driver.findElement(By.className('lista-promocoes'));

        const items = await list.findElements(By.className('promocao'));


        for (const item of items) {
            //*[@id="promocao-124989"]/div[2]/h3/a
            const text = await item.findElement(By.xpath('div[2]/h3/a')).getText();

            let price = await item.findElement(By.xpath('div[2]/p[2]/span')).getText()

            if (price == 'R$')
                price = await item.findElement(By.xpath('div[2]/p[2]/span[2]')).getText()

            const item2insert = new Item(text, price);
            await sales.insertOne(item2insert);
        }

        const dataOnDb = await sales.find();
        console.log(await dataOnDb.toArray());

    } catch (err) {
        console.log(err);
    }

}

main();