from protorpc import messages

class ChecklistItemMessage(messages.Message):
  """ProtoRPC representation of a ChecklistItem model instance.
  """
  created_date = messages.IntegerField(1)
  content = messages.StringField(2)
  completed = messages.BooleanField(3, default=False)
  key = messages.StringField(4)


class ChecklistItemMessageUpdate(messages.Message):
  """ProtoRPC message for encapsulating the ChecklistItemMessage.
  """
  checklist_item = messages.MessageField(ChecklistItemMessage, 1)


class ChecklistItems(messages.Message):
  """ProtoRPC message for encapsulating multiple ChecklistItemMessages.
  """
  checklist_items = messages.MessageField(ChecklistItemMessage, 1,
                                          repeated=True)
