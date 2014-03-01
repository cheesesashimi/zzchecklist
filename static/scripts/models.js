/**
 * Creates a ChecklistItemModel instance.
 *
 * @constructor
 * @param {Object} checklistItem A JSON object returned from the server.
 */
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

/**
 * Returns a stringified JSON representation of the model's properties.
 *
 * @return {String} The stringified JSON to return.
 */
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

/**
 * Starts a visible activity spinner during AJAX calls.
 */
ChecklistItemModel.prototype.startSpinner = function() {
  this.spinner = new Spinner().spin();
  $('#loading').append(this.spinner.el);
};

/**
 * Stops the activity spinner.
 */
ChecklistItemModel.prototype.stopSpinner = function() {
  this.spinner.stop();
};

/**
 * AJAX call to store this model's data on the server.
 */
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

/**
 * AJAX call to delete this model's data from the server and delete itself.
 */
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

/**
 * Toggles whether the item is completed or not.
 */
ChecklistItemModel.prototype.toggle = function() {
  this.completed = !this.completed;
  this.save();
};

/**
 * Callback executed upon successful save.
 *
 * @param {Object} json JSON returned from the server.
 */
ChecklistItemModel.prototype.onSave = function(json) {
  this.key = json.checklist_item.key;
  this.createdDate = json.checklist_item.created_date;
  this.stopSpinner(); 
};



/**
 * Creates a master collection of ChecklistItemModels and provides
 * a number of utility methods to aid working with them.
 *
 * @constructor
 */
var ChecklistItems = function() {
  this.items = new Array();
};

/**
 * Initializes the object with data received from the server.
 *
 * @param {Object} checklistItems A JSON object to parse.
 */
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

/**
 * Setter that appends a new ChecklistItemModel onto the array.
 *
 * @param {ChecklistItemModel} checklistItemModel The model instance to add.
 */
ChecklistItems.prototype.add = function(checklistItemModel) {
  this.items.push(checklistItemModel);
};

/**
 * Utility method to delete the item from the array and call it's delete method.
 *
 * @param {String} key The key to delete.
 */
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

/**
 * Utility method to get an item by key. Performs a linear search until the
 * item is found.
 *
 * @param {String} key The key to search for.
 */
ChecklistItems.prototype.findByKey = function(key) {
  return jQuery.grep(this.items, function(item, index) {
    return item.key == key;
  })[0];
};

/**
 * Getter that returns all items in the array.
 *
 * @param <Array, {ChecklistItemModel} The array of model instances.
 */
ChecklistItems.prototype.getAllItems = function() {
  return this.items;
};

/**
 * Getter that returns all items in the array that are marked completed.
 *
 * @param <Array, {ChecklistItemModel} The array of model instances.
 */
ChecklistItems.prototype.getCompletedItems = function() {
  return jQuery.grep(this.items, function(item, index) {
    if (item.completed) {
      return item;
    }
  });
};

/**
 * Getter that returns all items in the array that are not marked completed.
 *
 * @param <Array, {ChecklistItemModel} The array of model instances.
 */
ChecklistItems.prototype.getNotCompletedItems = function() {
  return jQuery.grep(this.items, function(item, index) {
    if (!item.completed) {
      return item;
    }
  });
};
