start =
  command

command =
  (basicComm / movecomm / inventoryComm / containerComm / actorComm / actionComm)

basicComm "Basic Command" =
  match:(
      'look' /
      'help' /
      'wait' /
      'dance' /
      'exit' /
      'quit' /
      'save' /
      'load' /
      'inventory') .*
  { return { command: match, type: 'basic' };}

movecomm "Movement Command" =
  match:('go' / 'move' / 'walk') maybeArticle dir:direction?
  { return { command: match, direction: dir, type: 'movement' };}

direction =
  ('north' / 
   'south' / 
   'east' / 
   'west')

action =
  ('using' /
   'with' / 
   'to')

inventoryAction =
  ('give' / 
   'drop' /
   'throw' /
   'put')

containerAction =
  ('open' / 
   'unlock' /
   'smash' /
   'kick')

actorAction =
  ('talk' / 
   'kick' /
   'tickle' /
   'yell')

usingPart =
  action maybeArticle usingItem:oneOrTwoWords
  { return usingItem }

inventoryComm "Inventory Command" =
  match:inventoryAction maybeArticle item:oneOrTwoWords maybeArticle usingItem:usingPart? .*
  { return { command: match, item: item, usingItem: usingItem, type: 'inventory' };}

containerComm "Container Command" =
  match:containerAction maybeArticle container:oneOrTwoWords maybeArticle usingItem:usingPart? .*
  { return { command: match, container: container, usingItem: usingItem, type: 'container' };}

actorComm "Actor Command" =
  match:actorAction maybeArticle actor:oneOrTwoWords maybeArticle usingItem:usingPart? .*
  { return { command: match, actor: actor, usingItem: usingItem, type: 'actor' };}

actionComm "Action Command" =
  match:word maybeArticle item:oneOrTwoWords maybeArticle usingItem:usingPart? .*
  { return { command: match, item: item, usingItem: usingItem, type: 'action' };}

article =
  ('the' / 
   'a' /
   'at')

maybeArticle =
  ((ws / article)+)?

twoWords =
  first:word wss:ws !action second:(word)
  { return first + (wss||"") + (second||"")  }

oneOrTwoWords =
  (twoWords / word)

word =
  letters:([a-z]+)
  { return letters.join(""); }

ws "Whitespace" =
  [ \t]

_ "One or more whitespaces" = 
  ws+


