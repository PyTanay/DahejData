const tagNameCorrector = (tagDetails) => {
    const descriptionList = [];

    try {
        for (let elem of tagDetails) {
            descriptionList.push(elem['Description']);
        }
        descriptionList.forEach((elem, j) => {
            var conflictNo = 1;
            for (let i = j + 1; i < descriptionList.length; i++) {
                if (descriptionList[i] === descriptionList[j]) {
                    descriptionList[i] = descriptionList[i] + '_' + conflictNo;
                    conflictNo++;
                }
            }
        });
        if (tagDetails.length !== descriptionList.length)
            throw new Error(
                'Error in push to secondary table corrector function for duplicate discription entries. Lenght of corrected array does not match actual data!'
            );
        for (let k = 0; k < tagDetails.length; k++) {
            tagDetails[k]['Description'] = descriptionList[k];
        }
        // for(let k=0;k<descriptionList["Description"].length)
        // fs.writeFile('./log.json', JSON.stringify(tagDetails), (err) => {
        //     if (err) throw err;
        //     console.log('File was saved!');
        // });
    } catch (err) {
        console.log('Error from TagName corrector function.', err);
        throw err;
    }
};

export default tagNameCorrector;
