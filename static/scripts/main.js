var ChecklistView = function() {
  this.checklistItems = new ChecklistItems();
  this.listContext = 'all';
  this.spinner = new Spinner().spin();
  $('#loading').append(this.spinner.el);
};

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

ChecklistView.prototype.setActiveFilter = function() {
  $('.active').removeClass('active');
  $('#' + this.listContext).addClass('active');
};

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

ChecklistView.prototype.handleAjaxResponse = function(json) {
  this.checklistItems.init(json);
  if (this.checklistItems) {
    this.items = this.checklistItems.getAllItems();
    this.renderList();
  }
  this.spinner.stop();
};

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

ChecklistView.prototype.init = function() {
  this.wireEventHandlers();
  this.makeInitialAjaxCall();
};

$(function() {
  var view = new ChecklistView();
  view.init();
});
