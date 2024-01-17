const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose =require("mongoose")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://0.0.0.0:27017/todolistDB",{useNewUrlParser:true})

const listSchema={name: String}
const customSchema ={ name:String, items:[listSchema]}

const ListItem =mongoose.model("Item",listSchema)
const customList = mongoose.model("list",customSchema)

const item1 = new ListItem({name:"Welcome todolistv2"})
const item2 = new ListItem({name:"How are you"})
const item3 = new ListItem({name:"Just waisitng time"})

const defaultItems = [item1, item2, item3]


app.get("/", function(req, res) {
  ListItem.find({}).then(function(obj){
    if (obj.length===0){
      ListItem.insertMany(defaultItems).then((obj)=>{console.log("Succesful"+obj)}).catch((err)=>{console.log(err)})
    }
    res.render("list", {listTitle: "Today", newListItems: obj})
  }).catch((err)=>{console.log(err)})
})

app.get("/:CustomListName", function(req, res){
  const customListName = req.params.CustomListName
  customList.findOne({name:customListName}).then(function(foundList){
    if (foundList==null){
      const l1=new customList({
        name:customListName,
        items:defaultItems
      });
      l1.save()
      res.redirect("/"+customListName)
    }else{
      res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
    }})  
})


app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list

  const xitem= new ListItem({name:itemName})
  
  if (listName==="Today"){ 
    xitem.save()
    res.redirect("/")
  }else{
    customList.findOne({name:listName}).then(function(founded){
      if(founded!==null){
        console.log(founded)
        founded.items.push(xitem);
        founded.save()
        res.redirect("/"+listName)
      }
    }).catch(function(err){
      console.log(err)
    })

  }
});

app.post("/delete",function(req, res){
  const del_id = req.body.checkbox
  ListItem.findByIdAndRemove(del_id).then(function(obj){
    if (!obj){
      console.log("err")
    }else{
      console.log("success")
    }
    })    
  res.redirect("/")
})



//   if (req.body.list === "Work") {
//     workItems.push(item);
//     res.redirect("/work");
//   } else {
//     items.push(item);
//     res.redirect("/");
//   }
// });

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
