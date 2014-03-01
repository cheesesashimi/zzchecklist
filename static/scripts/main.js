/**
 * Provides the main view for our Checklist application.
 *
 * @constructor
 */
var ChecklistView = function() {
  this.checklistItems = new ChecklistItems();
  this.listContext = 'all';
  this.spinner = new Spinner().spin();
  $('#loading').append(this.spinner.el);
};

/** 
 * Wires up our event handlers using event delegation wherever possible.
 */
ChecklistView.prototype.wireEventHandlers = function() {
  $('#create-new-item').click($.proxy(this.createItemCallback, this));

  $('#content-input').click(function() {
    $('#content-input')[0].value = '';
  });

  $('#checklist-main').on('click', 'input', $.proxy(function(event) {
    this.checklistItems.findByKey(event.target.dataset.key).toggle(); 
    this.renderList();  
  }, this));

  $('#checklist-main').on('click', 'a', $.proxy(function(event) {
    this.checklistItems.deleteItem(event.target.dataset.key);
    this.renderList();
  }, this));

  $('#filter').on('click', 'a', $.proxy(function(event) {
    this.listContext = event.target.id;
    this.renderList();
  }, this));
};

/**
 * Sets the active filtering UI components.
 */
ChecklistView.prototype.setActiveFilter = function() {
  $('.active').removeClass('active');
  $('#' + this.listContext).addClass('active');
};

/**
 * Gets the appropriate items per the filtering context selected.
 *
 * @param {String} context The context, all, completed, notcompleted.
 * @return <Array, {ChecklistItemModel} The items that match that context.
 */
ChecklistView.prototype.getItemsForContext = function(context) {
  this.listContext = context;

  switch(context) {
    case 'all':
      var items = this.checklistItems.getAllItems();
      break;
    case 'completed':
      var items = this.checklistItems.getCompletedItems();
      break;
    case 'notcompleted':
      var items = this.checklistItems.getNotCompletedItems();
      break;
    default:
      var items = this.checklistItems.getAllItems();
      this.listContext = 'all';
  }

  this.setActiveFilter();

  return items;
};

/**
 * Callback that is executed whenever the Submit button is pressed.
 */
ChecklistView.prototype.createItemCallback = function() {
  var input = $('#content-input')[0];
  if (input.value && input.value != input.defaultValue) {
    var item = new ChecklistItemModel();
    item.content = input.value;
    input.value = input.defaultValue;
    this.checklistItems.add(item.save());
    this.renderList();
  }
};

/**
 * Renders our list of items using the Handlebars.js templating engine,
 * tablesorter.js for providing an easily-sortable table and
 * moment.js for date parsing.
 */
ChecklistView.prototype.renderList = function() {
  // Need to destroy the tablesorter object to prevent duplicates.
  $('#checklist').trigger('destroy');

  // Remove any children so we can redraw this from scratch.
  $('#checklist-main').empty();

  var templateScript = $('#checklist-template').html();
  var template = Handlebars.compile(templateScript);
  Handlebars.registerPartial('checklist-item', $('#checklist-item').html());

  // Pretty-print the date using moment.js
  Handlebars.registerHelper('prettyDate', function() {
    return new Handlebars.SafeString(
      moment.unix(this.createdDate).format('LLLL'));
  });
  // Handlebars does not print boolean falses so we have to cast to string.
  Handlebars.registerHelper('completedHelper', function() {
    return new Handlebars.SafeString(this.completed.toString());
  });
  var items = this.getItemsForContext(this.listContext);
  $('#checklist-main').append(template(items));

  $('#checklist').tablesorter({
    sortList: [[1,1]],
  });
};

/**
 * Callback that handles the response from the server.
 *
 * @param {Object} json The JSON object returned from the server.
 */
ChecklistView.prototype.handleAjaxResponse = function(json) {
  this.checklistItems.init(json);
  if (this.checklistItems) {
    this.items = this.checklistItems.getAllItems();
    this.renderList();
  }
  this.spinner.stop();
};

/**
 * Sets up the initial AJAX call to the server.
 */
ChecklistView.prototype.makeInitialAjaxCall = function() {
  $.ajax({
    url: 'ChecklistService.GetAllItems',
    type: 'POST',
    data: '{}',
    dataType: 'json',
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Content-type', 'text/json');
    },
    success: $.proxy(this.handleAjaxResponse, this)
  }); 
};

/**
 * Initializes the page.
 */
ChecklistView.prototype.init = function() {
  this.wireEventHandlers();
  this.makeInitialAjaxCall();
};

/**
 * jQuery onReady() function.
 */
$(function() {
  var view = new ChecklistView();
  view.init();
});
