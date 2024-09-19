// const asynHandler =()=>{};


// const asynHandler =()=>{};
// const asynHandler =(fn)=>{ ()=>{} }; === const asynHandler =(fn)=>()=>{} ; 

// Higher Order Function (Using Promise)
const asynHandler =(requestHandle)=>{
    (req,res,next) =>{
        Promise.resolve(requestHandle(req,res,next)).
        catch((error)=> next(error) )
        }
    }

    export {asynHandler}
// Higher Order Function (Using Try Catch)
// const asynHandler = (fn)=> async(req,res,next)=>{
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success:false,
//             message:error.message
//         })
//     }
// }