var ChecklistView = function() {
  this.checklistItems = new ChecklistItems();
  this.listContext = 'all';
};

ChecklistView.prototype.wireEventHandlers = function() {
  $('#create-new-item').click($.proxy(this.createItemCallback, this));

  $('#checklist-main').on('click', 'input', $.proxy(function(event) {
    this.checklistItems.findByKey(event.target.id).toggle(); 
    this.renderList();  
  }, this));

  $('#checklist-main').on('click', 'a', $.proxy(function(event) {
    this.checklistItems.deleteItem(event.target.id);
    this.renderList();
  }, this));

  $('#filter').on('click', 'a', $.proxy(function(event) {
    this.listContext = event.target.id;
    this.renderList();
  }, this));
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

  return items;
};

ChecklistView.prototype.createItemCallback = function() {
  var item = new ChecklistItemModel();
  item.content = $('#content-input')[0].value;
  $('#content-input')[0].value = '';
  this.checklistItems.add(item.save());
  this.renderList();
};

ChecklistView.prototype.renderList = function() {
  // Need to destroy the tablesorter object to prevent duplicates.
  $("#checklist").trigger('destroy');

  // Remove any children so we can redraw this from scratch.
  $('#checklist-main').empty();

  var templateScript = $('#checklist-template').html();
  var template = Handlebars.compile(templateScript);
  Handlebars.registerPartial("checklist-item", $("#checklist-item").html());

  // Pretty-print the date
  Handlebars.registerHelper('prettyDate', function() {
    return new Handlebars.SafeString(
      moment.unix(this.createdDate).format('LLLL'));
  });
  // Handlebars does not print boolean falses so we have to cast to string.
  Handlebars.registerHelper('completedHelper', function() {
    return new Handlebars.SafeString(this.completed.toString());
  });
  var items = this.getItemsForContext(this.listContext);
  $("#checklist-main").append(template(items));

  $("#checklist").tablesorter();
};

ChecklistView.prototype.handleAjaxResponse = function(json) {
  this.checklistItems.init(json);
  if (this.checklistItems) {
    this.items = this.checklistItems.getAllItems();
    this.renderList();
  }
};

ChecklistView.prototype.makeInitialAjaxCall = function() {
  $.ajax({
    url: 'ChecklistService.GetAllItems',
    type: "POST",
    data: '{}',
    dataType: "json",
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
