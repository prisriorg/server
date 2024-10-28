
const utilityFunctions = {
    getUsernameFromEmail: function(email){
        var domainArray = email.split('@')
        var domain = domainArray[domainArray.length-1]
        var reverseEmail = email.split( '' ).reverse( ).join( '' );
        var reverseDomain = domain.split( '' ).reverse( ).join( '' );
        var backwardUsername = reverseEmail.replace(reverseDomain+'@','')
        var username = backwardUsername.split( '' ).reverse( ).join( '' );
        return username;
    },
    makeString: function(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return result;
    },
    hideUser:function(originalString){
        const charactersToMask = 4; 
        const maskedLength = originalString.length - charactersToMask * 2;
        const maskedString = originalString.substring(0, charactersToMask) + "*".repeat(maskedLength) + originalString.substring(originalString.length - charactersToMask);
        return maskedString;
    }


}


module.exports = {...utilityFunctions}