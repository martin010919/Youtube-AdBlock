// ==UserScript==
// @name         AdBlocker
// @namespace    http://tampermonkey.net/
// @version      5.95
// @description  Complete youtube adblocker, with the function the disable "youtube premium popup"
// @author       blynzdotdev & iamfugui & YelloNolo
// @match        *://*.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=YouTube.com
// @grant        none
// @license MIT
// ==/UserScript==

(function() {
    //strict rule
    `use strict`;
    // Any class the blocker uses
    const blockerClass = 'ytd-enforcement-message-view-model';
    // Any class on the broken video
    //  yt-playability-error-supported-renderers
    const ogVideoClass = 'yt-playability-error-supported-renderers';
    // Original Youtube URL
    const youtubeURL = "youtube.com";

    // Domains to redirect to.
    var domainList = [
        "youtube.com/embed",
        "yout-ube.com",
    ]

    var newDomain = domainList[0];
    //force func.
    const tempReplaceClass = "replaceme";
    let isBlocked = false;
    let isSubChange = false;
    let isChangingFrame = false;
    var updatedURL = window.location.href;
    var previousDropdownValue; 

    function checkClass() {
        const elements = document.querySelectorAll("." + blockerClass);
        if (elements.length > 0) {
            isBlocked = true;
        }

        if (isBlocked) {
            console.log("Replacing Original [checkClass]");
            replaceVideo();
            addDomainToURLs();
            isBlocked = false;
        } else {
            // console.log("[checkClass] #2") - Cogs Log
            urlTracker();
            dropdownTracker();
        }
    }

    //reload iframe
    function urlTracker() {
        var currentURL = window.location.href;
        // console.log("Test URL [urlTracker]"); - Cogs Log
        if (currentURL != updatedURL) {
            console.log("Found New URL");
            updatedURL = window.location.href;
            if (isSubChange) {
                isBlocked = true;
            }
        }
    }

    const cssSeletorArr = [
        `#masthead-ad`,
        `ytd-rich-item-renderer.style-scope.ytd-rich-grid-row #content:has(.ytd-display-ad-renderer)`,
        `.video-ads.ytp-ad-module`,
        `tp-yt-paper-dialog:has(yt-mealbar-promo-renderer)`,
        `ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-ads"]`,
        `#related #player-ads`,
        `#related ytd-ad-slot-renderer`,
        `ytd-ad-slot-renderer`,
        `yt-mealbar-promo-renderer`,
        `ad-slot-renderer`,
        `ytm-companion-ad-renderer`,
    ]; //done

    window.dev=true;

    /**
    * @param {Date} time 标准时间
    * @param {String} format 格式
    * @return {String}
    */
    function moment(time, format = `YYYY-MM-DD HH:mm:ss`) {
        let y = time.getFullYear()
        let m = (time.getMonth() + 1).toString().padStart(2, `0`)
        let d = time.getDate().toString().padStart(2, `0`)
        let h = time.getHours().toString().padStart(2, `0`)
        let min = time.getMinutes().toString().padStart(2, `0`)
        let s = time.getSeconds().toString().padStart(2, `0`)
        if (format === `YYYY-MM-DD`) {
            return `${y}-${m}-${d}`
        } else {
            return `${y}-${m}-${d} ${h}:${min}:${s}`
        }
    }

    /**
    * @param {String} msg
    * @return {undefined}
    */
    function log(msg) {
        if(!window.dev){
            return false;
        }
        console.log(`${moment(new Date())}  ${msg}`)
    }

    /**
    * @param {String} 
    * @return {String || Object}
    */
    function getUrlParams(param) {
        let urlStr = location.href.split(`?`)[1]
        if(!urlStr){
            return ``;
        }
        let obj = {};
        let paramsArr = urlStr.split(`&`)
        for(let i = 0,len = paramsArr.length;i < len;i++){
            let arr = paramsArr[i].split(`=`)
            obj[arr[0]] = arr[1];
        }

        if(!param){
            return obj;
        }

        return obj[param]||``;
    }

    /**
    * @param {String} styles
    * @return {undefined}
    */
    function generateRemoveADHTMLElement(styles) {
        if (document.getElementById(`RemoveADHTMLElement`)) {
            log(`屏蔽页面广告节点已生成`);
            return false
        }


        let style = document.createElement(`style`);
        style.id = `RemoveADHTMLElement`;
        (document.querySelector(`head`) || document.querySelector(`body`)).appendChild(style);
        style.appendChild(document.createTextNode(styles));
        log(`Block page generation successful`)

    }

    /**
    * @param {Array} cssSeletorArr
    * @return {String}
    */
    function generateRemoveADCssText(cssSeletorArr){
        cssSeletorArr.forEach((seletor,index)=>{
            cssSeletorArr[index]=`${seletor}{display:none!important}`;
        });
        return cssSeletorArr.join(` `);
    }

    /**
    * @return {undefined}
    */
    function nativeTouch(){
        const minNum = 100;
        const maxNum = 999;
        const randomNum = (Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum)/1000;

        let element =this;
        let touch = new Touch({
            identifier: Date.now(),
            target: element,
            clientX: 111+randomNum,
            clientY: 222+randomNum,
            radiusX: 333+randomNum,
            radiusY: 444+randomNum,
            rotationAngle: 0,
            force: 1
        });

        let touchStartEvent = new TouchEvent("touchstart", {
            bubbles: true,
            cancelable: true,
            view: window,
            touches: [touch],
            targetTouches: [touch],
            changedTouches: [touch]
        });


        element.dispatchEvent(touchStartEvent);


        let touchEndEvent = new TouchEvent("touchend", {
            bubbles: true,
            cancelable: true,
            view: window,
            touches: [],
            targetTouches: [],
            changedTouches: [touch]
        });

        element.dispatchEvent(touchEndEvent);
    }

    /**
    * @return {undefined}
    */
    function skipAd(mutationsList, observer) {
        let video = document.querySelector(`.ad-showing video`) || document.querySelector(`video`);
        let skipButton = document.querySelector(`.ytp-ad-skip-button`);
        let shortAdMsg = document.querySelector(`.video-ads.ytp-ad-module .ytp-ad-player-overlay`);

        if(!skipButton && !shortAdMsg){
            log(`######Does not exist######`);
            return false;
        }

        
        if(skipButton)
        {
            log(`Normal Ad~~~~~~~~~~~~~`);
            log(`Total Time:`);
            log(`${video.duration}`)
            log(`Current Time:`);
            log(`${video.currentTime}`)
            //type:
            skipButton.click();//PC
            nativeTouch.call(skipButton);//Phone
            log(`skip button~~~~~~~~~~~~~`);
            return false;
        }


        if(shortAdMsg){
            log(`Forced Ad~~~~~~~~~~~~~`);
            log(`Duration:`);
            log(`${video.duration}`)
            log(`Current Time:`);
            log(`${video.currentTime}`)
            video.currentTime = video.duration;
            log(`Forced Ad End~~~~~~~~~~~~~`);
            return false;
        }
    }

    /**
    * @return {undefined}
    */
    function removePlayerAD(){

        if (document.getElementById(`removePlayerAD`)) {
            log(`removePlayerAd`);
            return false
        }

        let style = document.createElement(`style`);
        style.id = `removePlayerAD`;
        (document.querySelector(`head`) || document.querySelector(`body`)).appendChild(style);

        let observer;
        let timerID;

        function startObserve(){

            const targetNode = document.querySelector(`.video-ads.ytp-ad-module`);

            if(!targetNode){
                log(`NoAd`);
                return false;
            }

            const config = {childList: true, subtree: true };
            observer = new MutationObserver(skipAd);
            observer.observe(targetNode, config);

            timerID=setInterval(skipAd, 512);

        }

        
        function closeObserve(){
            observer.disconnect();
            observer = null;
            clearInterval(timerID);
        }

        
        setInterval(function(){
            
            if(getUrlParams(`v`)){
                if(observer){
                    return false;
                }
                startObserve();
            }else{
                
                if(!observer){
                    return false;
                }
                closeObserve();
            }
        },16);

        log(`Run: remove ad`)
    }

    /**
    * 
    */
    function main(){
        generateRemoveADHTMLElement(generateRemoveADCssText(cssSeletorArr));
        removePlayerAD();
    }

    if (document.readyState === `loading`) {
        log(`YouTube script load:`);
        document.addEventListener(`DOMContentLoaded`, main);
    } else {
        log(`YouTube script loaded:`);
        main();//`DOMContentLoaded`
    }

})();