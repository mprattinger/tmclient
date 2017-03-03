
"use strict";

class MFRC522Mock{

    constructor(){
        this.firstTime = null;
        this.cardFound = false;
    }


    findCard(){
        var ret = {};
        
        if(!this.firstTime) this.firstTime = new Date();

        var curr = new Date();
        var diff = (curr.getTime() - this.firstTime.getTime()) / 1000;
        diff = Math.round(diff);
        if(diff == 5 && !this.cardFound){
            this.cardFound = true;
            ret.status = true;
        }
        return ret;
    }

    getUid(){
        var ret = {};
        ret.status = true;
        ret.data = [50, 76, 174, 197, 21];
        return ret;
    }
}

module.exports = MFRC522Mock;