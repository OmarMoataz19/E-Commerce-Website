const express=require('express');
const cors= require('cors');
const mongoose= require('mongoose');
const session = require('express-session');
var path = require('path');
const {MongoClient} = require('mongodb');
require ('dotenv').config();
const app= express();

app.use(session({secret:'oncart'}));
app.use(cors());
var bodyParser= require('body-parser');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
var User = require('./models/user-model');
var sess;
//Connecting to the database//////////////////
const uri = process.env.ATLAS_URI;
const Client= new MongoClient(uri);
mongoose.connect(uri);

const connection = mongoose.connection;

connection.once('open' , () =>{
    console.log("MongoDB is connected..");
})
//---------------------------------------------

app.set(path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//-------------------------------------------------

app.use(express.static(path.join(__dirname,'public')));

//------------------------------------------------------
// Functions -----------------------------------------

//Searches for a user 
async function findUsernamePassword(Client,userName,Password) {
    const found=await Client.db('myFirstDatabase').collection('users').findOne({username:userName,password:Password})
    if(found)
        return true 
    else 
        return false
    }
    //------------------------------------------------------------------------------------------------------------------
    //Insert a user into the collection
     function insertUser(Client,username,password){
        var newUser = new User(
            {
            username,
            password,
        }
        )
        Client.db('myFirstDatabase').collection('users').insertOne(newUser);
    }
    //--------------------------------------------------------------------------------------------------------------------
    
    //search for a user using the username only
    async function findUsername(Client,username){
        const found =await Client.db('myFirstDatabase').collection('users').findOne({username:username})
        if(found)
            return true 
        else 
            return false 
    }
    
//------------------------------------------------------------------------------------------------------------------------
//for rendering the login page and handling the login button---
app.get('/',function (req,res){
    sess=undefined         
    res.render('login', { alert: "" });
});

app.get('/', function(req, res) {
    sess=undefined
    var passedVariable = req.query.alert;
    res.render('login', { alert: passedVariable })
});

app.post('/', async function (req,res){
    await Client.connect()
    
    
    var inputuserName= req.body.username
    var inputpassword= req.body.password

    if (inputuserName == "" || inputpassword == "") {
        res.render('login', { alert: "Username/Password cannot be empty." })
    } else {
   var found= await findUsernamePassword(Client,inputuserName,inputpassword)
    if(found){
        sess=req.session;
        sess.username=inputuserName;
        res.redirect('home')
       
    }
    else
        res.render('login', { alert: "Wrong Username/Password" })
}
})
//---------------------------------------------------------------------------------------------- 


//for rendering the Registration page and handling the register button--------------------------
app.get('/registration',function(req,res){
    res.render('registration', { alert: "" })
});
app.post('/register',async function(req,res){
    var username=req.body.username;
    var password=req.body.password;

    if (username == "" || password == "") {
        res.render('registration', { alert: "Username/password cannot be empty." })
    }else{
    await Client.connect();
    found =  await findUsername(Client,username)
    if(!found){
            insertUser(Client,username,password)
            res.send('<script>alert("you have registered successfully"); window.location.href = "/"; </script>');
    }
    else    
    res.render('registration', { alert: "This Username is already taken." })      
  
}});
//-------------------------------------------------------------------------------------------------

 app.get('/cart', async function(req,res){
    if(sess == undefined) {
        res.send('<script>alert("you are not allowed to access this page until you login"); window.location.href = "/"; </script>');
        return;
    }
    else {
        await Client.connect(); 
        sess= req.session
         const userFound=await Client.db('myFirstDatabase').collection('users').findOne({username:sess.username})
        
         if(userFound)
    
        {    
        var cart = userFound.cart
    
         res.render('cart', {cart:cart})
     }
    }
    });
 app.get('/searchresults',function(req,res){
    if(sess == undefined) {
        res.send('<script>alert("you are not allowed to access this page until you login"); window.location.href = "/"; </script>');
        return;
    }
    res.render('searchresults', { alert: "" })
 });


-//add to cart button-----------------------------------------------------------------------------------------
app.post('/addtocart', async function (req,res){
    await Client.connect();
    sess = req.session
    var itemname= req.body.id
    const userFound=await Client.db('myFirstDatabase').collection('users').findOne({username:sess.username})
    var item=await Client.db('myFirstDatabase').collection('items').findOne({name:itemname})
  
    var id= userFound._id
    var tempCart=userFound.cart

    var flag = false;
    if(!userFound.cart.length==0){
        for(var i=0;i<userFound.cart.length;i++){
            if(userFound.cart[i].item.name===itemname){
                flag=true;
                break;
        }
    }
    if(flag){
            res.send('<script>alert("Item already in cart"); window.location.href = "/home"; </script>');
    }
    else{
            await Client.db('myFirstDatabase').collection('users').updateOne({_id: id}, {$push: {cart: {item}}})
            res.redirect('/home')
    }

//------------------------------------------------------------------------------------------------------------
}
else{
    await Client.db('myFirstDatabase').collection('users').updateOne({_id: id}, {$push: {cart: {item}}})
    res.redirect('/home')
}
})
app.post('/search', async function (req,res){
    await Client.connect()

    var inputSearch= req.body.Search;
    if (inputSearch == "") {
        res.send('<script>alert("Search bar cannot be empty"); window.location.href = "/home"; </script>');

    } else {
    const itemFound =await Client.db('myFirstDatabase').collection('items').findOne({name:inputSearch})
        res.render('searchresults', { alert: inputSearch }) 

}}
)
app.get('/iphone', async function (req,res){ 
    if(sess == undefined) {
        res.send('<script>alert("you are not allowed to access this page until you login"); window.location.href = "/"; </script>');
        return;
    }
    res.render('iphone')
});
app.post('/iphone',function(req,res){
})

app.get('/books',function (req,res){ 
    if(sess == undefined) {
        res.send('<script>alert("you are not allowed to access this page until you login"); window.location.href = "/"; </script>');
        return;
    }
    res.render('books')
});

app.post('/books',function(req,res){
})

app.get('/leaves', async function (req,res){ 
    if(sess == undefined) {
        res.send('<script>alert("you are not allowed to access this page until you login"); window.location.href = "/"; </script>');
        return;
    }
    res.render('leaves')
});
app.post('/leaves',function(req,res){
})

app.get('/sun', async function (req,res){ 
    if(sess == undefined) {
        res.send('<script>alert("you are not allowed to access this page until you login"); window.location.href = "/"; </script>');
        return;
    }
    res.render('sun')
});
app.post('/sun',function(req,res){
})


app.get('/phones',function (req,res){ 
    if(sess == undefined) {
        res.send('<script>alert("you are not allowed to access this page until you login"); window.location.href = "/"; </script>');
        return;
    }
    res.render('phones')
});
app.post('/phones',function(req,res){
})

app.get('/galaxy', async function (req,res){ 
    if(sess == undefined) {
        res.send('<script>alert("you are not allowed to access this page until you login"); window.location.href = "/"; </script>');
        return;
    }
    res.render('galaxy')
});
app.post('/galaxy',function(req,res){
})

app.get('/home', async function (req,res){ 
    if(sess == undefined) {
        res.send('<script>alert("you are not allowed to access this page until you login"); window.location.href = "/"; </script>');
        return;
    }
    res.render('home')
});
app.post('/home',function(req,res){
})


app.get('/sports',function (req,res){ 
    if(sess == undefined) {
        res.send('<script>alert("you are not allowed to access this page until you login"); window.location.href = "/"; </script>');
        return;
    }
    res.render('sports')
});
app.post('/sports',function(req,res){
})


app.get('/boxing', async function (req,res){
    if(sess == undefined) {
        res.send('<script>alert("you are not allowed to access this page until you login"); window.location.href = "/"; </script>');
        return;
    } 
    res.render('boxing')
});
app.post('/boxing',function(req,res){
})

app.get('/tennis', async function (req,res){ 
    if(sess == undefined) {
        res.send('<script>alert("you are not allowed to access this page until you login"); window.location.href = "/"; </script>');
        return;
    }
    res.render('tennis')
});
app.post('/tennis',function(req,res){
})

// Back Buttons
app.post('/back',function(req,res){
    res.redirect('home')
})
app.post('/backphones',function(req,res){
    res.redirect('phones')
})
app.post('/backsports',function(req,res){
    res.redirect('sports')
})
app.post('/backbooks',function(req,res){
    res.redirect('books')
})
app.post('/backregister',function(req,res){
    res.redirect('/')
})
app.post('/backsearch',function(req,res){
    res.redirect('home')
})

if(process.env.PORT) {
    app.listen(process.env.PORT, function() {console.log('Server started...')});
  }
  else {
    app.listen(5000, function() {console.log('Server started on port 5000...')});
  }
