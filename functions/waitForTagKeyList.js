function waitForTagKeyList(tagKeyList) {
    return new Promise((resolve) => {
        const checkTagKeyList = setInterval(() => {
            if (tagKeyList) {
                clearInterval(checkTagKeyList);
                resolve(tagKeyList);
            }
        }, 100); // Check every 100ms
    });
}

export default waitForTagKeyList;
