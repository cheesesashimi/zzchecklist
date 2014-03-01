var ChecklistItemModel = function(checklistItem) {
  if (checklistItem) {
    this.content = checklistItem.content;
    this.key = checklistItem.key;
    this.createdDate = checklistItem.created_date;
    this.completed = checklistItem.completed;
  } else {
    this.content = null;
    this.key = null;
    this.createdDate = null;
    this.completed = false;
  }
};

ChecklistItemModel.prototype.toJson = function() {
  return JSON.stringify({
    'checklist_item': {
      'content': this.content,
      'key': this.key,
      'created_date': this.createdDate,
      'completed': this.completed
    }
  });
};

ChecklistItemModel.prototype.startSpinner = function() {
  this.spinner = new Spinner().spin();
  $('#loading').append(this.spinner.el);
};

ChecklistItemModel.prototype.stopSpinner = function() {
  this.spinner.stop();
};

ChecklistItemModel.prototype.save = function() {
  if (this.key) {
    var remoteMethod = 'ChecklistService.UpdateItem';
  } else {
    var remoteMethod = 'ChecklistService.CreateItem';
  }

  this.startSpinner();

  $.ajax({
    /*
       We block on this AJAX call since we need to update the model
       with server-supplied values such as the date and the key.
    */
    async: false,
    url: remoteMethod,
    type: 'POST',
    data: this.toJson(),
    dataType: 'json',
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Content-type', 'text/json');
    },
    success: $.proxy(this.onSave, this)
  });

  return this;
};

ChecklistItemModel.prototype.deleteItem = function() {
  this.startSpinner();
  $.ajax({
    url: 'ChecklistService.DeleteItem',
    type: 'POST',
    data: this.toJson(),
    dataType: 'json',
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Content-type', 'text/json');
    },
    success: $.proxy(function() {
      this.stopSpinner();
      delete this;
    }, this)
  });
};

ChecklistItemModel.prototype.toggle = function() {
  this.completed = !this.completed;
  this.save();
};

ChecklistItemModel.prototype.onSave = function(json) {
  this.key = json.checklist_item.key;
  this.createdDate = json.checklist_item.created_date;
  this.stopSpinner(); 
};




var ChecklistItems = function() {
  this.items = new Array();
};

ChecklistItems.prototype.init = function(checklistItems) {
  var items = new Array();

  if (checklistItems.checklist_items) {
    $.each(checklistItems.checklist_items,
        function(index, value) {
          items.push(new ChecklistItemModel(value));
    }); 
  }
  this.items = items;
}

ChecklistItems.prototype.add = function(checklistItemModel) {
  this.items.push(checklistItemModel);
};

ChecklistItems.prototype.deleteItem = function(key) {
  var itemIndex = 0;

  jQuery.grep(this.items, function(item, index) {
    if (item.key == key) {
      itemIndex = index;
      return true;
    }
  });

  this.items[itemIndex].deleteItem();
  this.items.splice(itemIndex, 1);
};

ChecklistItems.prototype.findByKey = function(key) {
  return jQuery.grep(this.items, function(item, index) {
    return item.key == key;
  })[0];
};

ChecklistItems.prototype.getAllItems = function() {
  return this.items;
};

ChecklistItems.prototype.getCompletedItems = function() {
  return jQuery.grep(this.items, function(item, index) {
    if (item.completed) {
      return item;
    }
  });
};

ChecklistItems.prototype.getNotCompletedItems = function() {
  return jQuery.grep(this.items, function(item, index) {
    if (!item.completed) {
      return item;
    }
  });
};
