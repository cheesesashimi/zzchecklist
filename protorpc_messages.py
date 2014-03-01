from protorpc import messages


class ChecklistKey(messages.Message):
  key = messages.StringField(1)


class ChecklistItemMessage(messages.Message):
  created_date = messages.IntegerField(1)
  content = messages.StringField(2)
  completed = messages.BooleanField(3)
  key = messages.StringField(4)


class ChecklistItemMessageUpdate(messages.Message):
  checklist_item = messages.MessageField(ChecklistItemMessage, 1)


class ChecklistItems(messages.Message):
  checklist_items = messages.MessageField(ChecklistItemMessage, 1, repeated=True)
