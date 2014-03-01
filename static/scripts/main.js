var ChecklistView = function() {
  this.checklistItems = new ChecklistItems();
};

ChecklistView.prototype.wireEventHandlers = function() {
  $('#create-new-item').click($.proxy(this.createItemCallback, this));

  $('#checklist-main').on('click', 'input', $.proxy(function(event) {
    this.checklistItems.findByKey(event.target.id).toggle();
  }, this));

  $('#checklist-main').on('click', 'button', $.proxy(function(event) {
    this.checklistItems.deleteItem(event.target.id);
    this.renderList();
  }, this));

  $('#filter').on('click', 'li', $.proxy(this.filterItemsCallback, this));
};

ChecklistView.prototype.filterItemsCallback = function(event) {
  switch(event.target.id) {
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
  }

  this.renderList(items);
};

ChecklistView.prototype.createItemCallback = function() {
  var item = new ChecklistItemModel();
  item.content = $('#content-input')[0].value;
  this.checklistItems.add(item.save());
  this.renderList();
};

ChecklistView.prototype.renderList = function(items) {
  if (!items) {
    var items = this.checklistItems.getAllItems();
  }
  $('#checklist-main').empty();
  var templateScript = $('#checklist-template').html();
  var template = Handlebars.compile(templateScript);
  Handlebars.registerPartial("checklist-item", $("#checklist-item").html());
  Handlebars.registerHelper('prettyDate', function() {
    return new Handlebars.SafeString(
      moment.unix(this.createdDate).format('LLLL'));
  });
  $("#checklist-main").append(template(items));
};

ChecklistView.prototype.handleAjaxResponse = function(json) {
  this.checklistItems.init(json);
  if (this.checklistItems) {
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
