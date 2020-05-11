
export const onError = (error, source?) => {

    let obj = {};

    try{
        obj = JSON.parse( JSON.stringify(error, Object.getOwnPropertyNames(error)) );
    }catch(e){}

    console.log('error', obj, source);
    
}
