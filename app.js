const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const date = require(__dirname + '/date.js');

const app = express();
// const items = ['Item1', 'Item2', 'Item3'];
// const workItems = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://localhost:27017/todolistDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please, enter a name for your item.']
  }
});

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({ name: 'Welcome to your todolist!' });
const item2 = new Item({ name: 'Hit the + button to add a new item.' });
const item3 = new Item({ name: '<-- Hit this to delete an item.' });
const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model('List', listSchema);

app.get('/', function(req, res) {
  let day = date.getDate();

  Item.find({}, (err, foundItems) => {
    if (err) {
      console.log(err);
    } else if (foundItems.length === 0) {
      Item.insertMany(defaultItems, err => {
        if (err) {
          console.log(err);
        } else {
          console.log('Default items have been added to the list.');
        }
      });
      res.redirect('/');
    } else {
      res.render('list', { listTitle: day, itemsList: foundItems });
    }
  });
});

app.post('/', function(req, res) {
  const activeList = req.body.list;
  const postItem = req.body.newItem;

  const newItem = new Item({
    name: postItem
  });

  List.findOne({ name: activeList }, (err, foundList) => {
    if (err) {
      console.log(err);
    } else if (foundList) {
      foundList.items.push(newItem);
      foundList.save(err => {
        if (err) {
          console.log(err);
        } else {
          console.log(`A new item has been added to ${foundList.name} list`);
          res.redirect(`/${activeList}`);
        }
      });
    } else {
      newItem.save(err => {
        if (err) {
          console.log(err);
        } else {
          console.log('A new item has been added to the root list.');
          res.redirect('/');
        }
      });
    }
  });
});

app.post('/delete', (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (List.findOne({name: listName})) {
    console.log(`list.findone: ${List.findOne({name: listName})}`);
    List.findOneAndUpdate(
      {name: listName},
      {$pull: {items: {_id: checkedItemId} } }, (err, foundList) => {
        if (err) {
          console.log(err);
        } else {
          console.log(`The checked item has been deleted from ${listName} list.`)
          res.redirect(`/${listName}`);
        }
      }
    );

  } else {
    Item.findByIdAndRemove(checkedItemId, err => {
      if (err) {
        console.log(err);
      } else {
        console.log('The checked item has been deleted from db.');
      }
    });
    res.redirect('/');
  }

});

app.get('/:listName', (req, res) => {
  const listTitle = req.params.listName;

  List.findOne({ name: listTitle }, (err, foundList) => {
    if (err) {
      console.log(err);
    } else if (foundList) {
      res.render('list', { listTitle: listTitle, itemsList: foundList.items });
    } else {
      const list = new List({
        name: listTitle,
        items: defaultItems
      });

      list.save();
      res.redirect(`/${listTitle}`);
    }
  });
});

app.listen(3000, function() {
  console.log('Server started on port 3000');
});
