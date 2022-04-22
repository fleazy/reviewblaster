const puppeteer = require('puppeteer')
const chalk = require('chalk')

async function scrapeIt() {

    const browser = await puppeteer.launch({
        args: ['--disable-dev-shm-usage'],
        headless: true
    });
    const page = await browser.newPage();


    await page.goto(process.argv[2]);
    page.waitForTimeout(5000)
    page.waitForSelector('.reviews-summary__num-reviews-right-rail')
    let msg = await page.evaluate(function () {
        let msg = document.querySelector('.reviews-summary__num-reviews-right-rail').textContent
        return msg;
    });
    console.log(chalk.cyan(msg));

    let reviewRegex = new RegExp("\\\d{2,4}");
    let reviewNumber = msg.match(reviewRegex)[0];
    
    let reviewStartNumber = 0;
    
    //const reviewCount = await page.$('.reviews-summary__num-reviews-right-rail').textContent
    page.waitForTimeout(5000)
    await page.hover('#reviews');
    await page.hover('#amenities');
    await page.hover('#reviews');

    page.on('console', consoleObj => {
        if (consoleObj.type() === 'log') {
            if (consoleObj.text().indexOf("Matched Text") > -1) {
                console.log(chalk.black.bgYellow(consoleObj.text()));
            }
            else if (consoleObj.text().indexOf('Review Page') > -1) {
                console.log(chalk.black.bgWhite(consoleObj.text()));
            }
            else if (consoleObj.text().indexOf('checking') > -1) {
                console.log(chalk.cyan(consoleObj.text()));
            }
            else{
            console.log(chalk.yellow(consoleObj.text()));
        }
        }
        
    })




    const links = await page.evaluate(() => {

        setTimeout(() => {

            // reviewCounter += document.querySelector('.reviews-summary__num-reviews-right-rail').textContent
            // console.log(reviewCounter + " is the top review count")

            everything();

            function everything() {

                let theseReviews = document.querySelectorAll('.review__content')
                let uglyTitle = theseReviews[0].textContent.split('Stayed')[0]
                let reviewContent = document.querySelectorAll('.review__content')[1].textContent.split('Stayed')[1].substring(9).slice(0,-4)

                let regex = new RegExp(".{1}([\\\/]).");
                let regexMatch = RegExp("\\\d{2,6}");
                let descriptionRegex = RegExp("\\\d{3,6}");
                let cleanTitle = uglyTitle.split(regex)[0];

                theseReviews.forEach(function (el) {
                    uglyTitle = el.textContent.split('Stayed')[0]
                    cleanTitle = uglyTitle.split(regex)[0];
                    let cleanerTitle = cleanTitle.replace(/2007|2008|2009|2010|2011|2012|2013|2014|2015|2016|2017|2018|2019|2020|2021|2022_/g,'');
                    let reviewRange = document.querySelector('.pagination__text').textContent;
                    console.log('checking ' + reviewRange)
                    reviewContent = el.textContent.split('Stayed')[1].substring(9).slice(0,-13)
                    if (cleanerTitle.match(regexMatch)) {
                        console.log(cleanTitle + " FUCK YEAH")
                        console.log("Review Page " + reviewRange)
                    }
                    if (reviewContent.match(descriptionRegex)) {
                        let reviewMatch = reviewContent.match(descriptionRegex)[0]
                        if (reviewMatch < 2006 || reviewMatch > 2022) {
                            console.log(reviewMatch + " FUCK YEAH")
                            console.log(`Matched Text: "${reviewContent}"`)
                            console.log("Review Page " + reviewRange + " ^^^^^^^^^^^^^^^^^^^^^^^")
                        }
                        
                    }
                })
            }

            let nextButton = document.querySelector('#reviews > div > div > div > div > div > div.review-list > div.pagination > button.btn.btn-icon.ButtonIcon.btn-default.btn-sm.pagination__next.btn-icon-circle > span.SVGIcon.SVGIcon--16px.flex-center');
            nextButton.onclick = function () {
                setTimeout(() => {
                    everything();
                }, 1000);
            }
        }, 1000);
    });

    page.waitForSelector('#reviews')
    await page.click('#reviews')
    page.waitForSelector('.reviews-summary__num-reviews-right-rail')

    const hrefElement = await page.$$('.pagination__next');
    await page.waitForTimeout(3000)
    let value
    if (reviewNumber > 5) {

        while (value !== reviewNumber) {
            await page.waitForSelector('.pagination__next:not([disabled])');
            await page.waitForTimeout(800)
            let currentReviewNumber = await page.$('div.pagination > span > strong')
            let tempValue = await currentReviewNumber.evaluate(el => el.textContent)
            value = tempValue.split("–")[1];
            if (value == reviewNumber){
                break;
            } else{
                hrefElement[0].click();
            }
            

        }
        console.log("we're done");
        page.close();
        browser.close();
    }
         


}



scrapeIt();

