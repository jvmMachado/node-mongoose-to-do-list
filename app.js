const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const date = require(__dirname + '/date.js');

const app = express();
// const workItems = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

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

Item.insertMany(defaultItems, err => {
  if (err) {
    console.log(err);
  } else {
    console.log('Default items have been added to the list.');
  }
});

app.get('/', function(req, res) {
  let day = date.getDate();
  res.render('list', { listTitle: day, newListItem: items, itemsList: items });
});

app.post('/', function(req, res) {
  let item = req.body.newItem;

  if (req.body.list === 'Work') {
    workItems.push(item);
    res.redirect('/work');
  } else {
    items.push(item);
    res.redirect('/');
  }
});

app.get('/work', function(req, res) {
  res.render('list', {
    listTitle: 'Work',
    newListItem: workItems,
    itemsList: workItems
  });
});

app.listen(3000, function() {
  console.log('Server started on port 3000');
});
