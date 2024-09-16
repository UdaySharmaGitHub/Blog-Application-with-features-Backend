# Full Stack Blog Application Complete Backend

- [Model link](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj?origin=share)

---
# Not a good Approach to connect the database directly in the main file
```bash
;(async()=>{
    try{
   await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
   app.on("error",(error)=>{
    console.log("Not able to connect");
    throw error;
   })

   app.listen(process.env.PORT,()=>{
    console.log(`app is listing at port ${process.env.PORT}`);
})

    }catch(error){
        console.error(error);   
    }
})()
```