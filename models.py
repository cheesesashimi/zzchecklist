from google.appengine.ext import ndb
import protorpc_messages


class ChecklistItem(ndb.Model):
  """Provides storage for our checklist items.

  created_date; datetime: When the task was stored.
  content; string: The task content.
  completed; boolean: Whether the task is completed.
  """
  created_date = ndb.DateTimeProperty(auto_now_add=True)
  content = ndb.TextProperty()
  completed = ndb.BooleanProperty(default=False)

  def ToRpcMessage(self):
    """Creates a ProtoRPC message from this model.

    Returns:
      A ProtoRPC message version of this model.
    """
    message = protorpc_messages.ChecklistItemMessage()

    # UNIX timestamps are preferred for over-the-wire datetime transmission.
    message.created_date = int(self.created_date.strftime('%s'))

    message.content = self.content
    message.completed = self.completed

    # Use URL-safe NDB keys.
    message.key = self.key.urlsafe()
    return message

  def FromRpcMessage(self, message):
    """Updates the model properties with data received from the client.

    Args:
      message; ChecklistItemMessage: a ProtoRPC message instance.
    """
    self.content = message.content
    self.completed = message.completed 
