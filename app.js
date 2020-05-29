//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _=require("lodash");
const mongoose = require("mongoose");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser: true, useUnifiedTopology: true });

const itemSchema={
  name : String
};
const listSchema={
  name : String,
  items : [itemSchema]
};
const List = mongoose.model("List",listSchema);
const Item = mongoose.model("Item",itemSchema);
const item1 = new Item({
  name : "Hellow"
});
const item2 = new Item({
  name : "Press + To Add Items"
});
const item3 = new Item({
  name : "Click CheckBox To Delete Item"
});
const defaultItems= [item1,item2,item3];



app.get("/", function(req, res) {
  Item.find({},function(err,founditems){

    if (founditems.length==0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log("thsi is the error");
        } else { console.log("succes in inserting default into db");}
      });
      res.redirect("/");
    }else {
        res.render("list", {listTitle: "Today", newListItems: founditems});
    }
})
});



app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName =req.body.list; //to check from where user came from
const item= new Item({ //anyways create new item
  name : itemName
});
if(listName==="Today"){ //user came from "/" hence append to normal item schema
  item.save();
  res.redirect("/");
} else{
  List.findOne({name : listName},function(err,foundList){ //user came from custom list(list title), hence append to that
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName); //re route to that custom list
  });
}

});


app.post("/delete",function(req,res){
  const delItem= req.body.checkBox;
  const listName=req.body.listname;

  if(listName=="Today"){
    Item.findByIdAndRemove(delItem,function(err){
      if (err) {
        console.log(err);}
      else {console.log("deleted item");
    res.redirect("/");}
    });

  } else{
    List.findOneAndUpdate({name : listName},{$pull: {items :{_id: delItem}} },function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }

});


app.get("/:customname",function(req,res){
//  console.log(req.body.customname);

let customName=_.capitalize(req.params.customname);

List.findOne({name : customName},function(err,foundlist){
  if(!err){
   if(!foundlist){ //create new list
     const list= new List({
       name : customName,
       items : defaultItems
     });
     list.save();
     res.redirect("/"+customName)
   } else { // shiow the exisisting found list

    res.render("list",{listTitle: foundlist.name , newListItems : foundlist.items});
   }
  }
})

});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
