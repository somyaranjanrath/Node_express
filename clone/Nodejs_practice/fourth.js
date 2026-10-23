//normal code (sync)
console.log("Start")

//time taking code running in parallel using setTiomeout function
 function dotask(){ //(async)
    for(let i =1;i<=5;i++){
        console.log("doing Task");
    }
}
setTimeout(() => {
    dotask() 
},0);

//normal code (sync)
console.log("end")
//all the operation takes place one after another