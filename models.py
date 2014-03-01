from google.appengine.ext import ndb
import protorpc_messages


class ChecklistItem(ndb.Model):
  created_date = ndb.DateTimeProperty(auto_now_add=True)
  content = ndb.TextProperty()
  completed = ndb.BooleanProperty(default=False)

  def ToRpcMessage(self):
    message = protorpc_messages.ChecklistItemMessage()
    message.created_date = int(self.created_date.strftime('%s'))
    message.content = self.content
    message.completed = self.completed
    message.key = self.key.urlsafe()
    return message

  def IsPopulated(self):
    return self.created_date and content

  def FromRpcMessage(self, message):
    self.content = message.content
    self.completed = message.completed 
