var ChecklistItemModel = function(checklistItem) {
  if (checklistItem) {
    this.content = checklistItem.content || null;
    this.key = checklistItem.key || null;
    this.createdDate = checklistItem.created_date || null;
    this.completed = checklistItem.completed || false;
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

ChecklistItemModel.prototype.save = function() {
  if (this.key) {
    var remoteMethod = 'ChecklistService.UpdateItem';
  } else {
    var remoteMethod = 'ChecklistService.CreateItem';
  }

  $.ajax({
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
  $.ajax({
    url: 'ChecklistService.DeleteItem',
    type: 'POST',
    data: this.toJson(),
    dataType: 'json',
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Content-type', 'text/json');
    },
    success: $.proxy(function() {
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
  console.dir(checklistItemModel);
  this.items.push(checklistItemModel);
};

ChecklistItems.prototype.deleteItem = function(key) {
  var checklistItem = this.findByKey(key);
  checklistItem.deleteItem();
  this.items.splice(checklistItem.index, 1);
};

ChecklistItems.prototype.findByKey = function(key) {
  return jQuery.grep(this.items, function(item, index) {
    if (item.key == key) {
      return item;
    }
  })[0];
};
