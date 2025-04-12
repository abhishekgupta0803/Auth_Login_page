const mongoose = require('mongoose');

main().then(()=>{
    console.log("Connected");
}).catch(err => console.log(err));


async function main() {
  await mongoose.connect(process.env.MONGO_URL);
}

const userSchema = mongoose.Schema({
    username:String,
    age:Number,
    email:String,
    password:String,
});

module.exports = mongoose.model("user",userSchema);