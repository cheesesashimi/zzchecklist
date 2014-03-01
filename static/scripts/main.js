var ChecklistView = function() {
  this.checklistItems = new ChecklistItems();
};

ChecklistView.prototype.wireEventHandlers = function() {
  $('#create-new-item').click($.proxy(this.createItemCallback, this));

  $('#checklist-main').on('click', 'input', $.proxy(function(event) {
    this.checklistItems.findByKey(event.target.id).toggle();
    console.dir(event);
  }, this));

  /*
  $('#checklist-main').click(function(herp) {
    console.dir(herp);
  });
  */
};

ChecklistView.prototype.createItemCallback = function() {
  var item = new ChecklistItemModel();
  item.content = $('#content-input')[0].value;
  this.checklistItems.add(item.save());
  this.renderList();
};

ChecklistView.prototype.renderList = function() {
  $('#checklist-main').empty();
  var templateScript = $('#checklist-template').html();
  var template = Handlebars.compile(templateScript);
  $("#checklist-main").append(template(this.checklistItems.items));
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
