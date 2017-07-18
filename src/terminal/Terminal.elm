port module Main exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Http exposing (..)
import List exposing (map)
import Time exposing (Time, second)
import Json.Encode exposing (..)
import Json.Decode exposing (..)
import Debug exposing (log)
import Dom exposing (..)
import Task



main =
  Html.program
    { init = init
    , view = view
    , update = update
    , subscriptions = subscriptions
    }



-- MODEL

type alias TermResult = {
    command: String
  , result: String
  , pwd: String
  , resType: String
  }

-- There are two states to the shell. Term calls the api, and Game calls the webworker
type ShellState
  = Term
  | Game

type alias Model = {
    time: Time
  , shellInput: String
  , results: List (TermResult)
  , state: ShellState
  , token: String
  }


init : (Model, Cmd Msg)
init =
  (Model 0 "" [] Term "", Dom.focus "hiddenShellInput" |> Task.attempt FocusResult)

-- Decoder for JSON result
createResultDecoder: Json.Decode.Decoder TermResult
createResultDecoder = 
  Json.Decode.map4 TermResult
    ( Json.Decode.at ["command"] Json.Decode.string )
    ( Json.Decode.at ["result"] Json.Decode.string )
    ( Json.Decode.at ["pwd"] Json.Decode.string )
    ( Json.Decode.at ["type"] Json.Decode.string )

setToken res token =
  if (res.command == "requesttoken") then
    res.result
  else
    token

-- UPDATE

type Msg
  = Tick Time
  | UpdateInput String
  | FocusOn String
  | FocusResult (Result Dom.Error ())
  | RunAction
  | PostCreated (Result Http.Error TermResult)
  | ClearTerminal (Result Dom.Error String)
  | SwitchState (Result Dom.Error ShellState)
  | GameResult String


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    Tick newTime ->
      ({model | time = newTime}, Cmd.none)
    UpdateInput newInput ->
      ({model | shellInput = newInput }, Cmd.none)
    RunAction ->
      ( model, runAction model )
    PostCreated (Ok res) ->
      ( {model | results = res :: model.results, shellInput = "", token = setToken res model.token }, sendCmd model.shellInput )
    GameResult res ->
      ( {model | results = (TermResult model.shellInput res "~" "result") :: model.results, shellInput = "" }, sendCmd model.shellInput )
    PostCreated (Err _) ->
      ( {model | results = (TermResult model.shellInput "An Error Occurred" "~" "error") :: model.results, shellInput = "" }, sendCmd model.shellInput )
    FocusOn id ->
        ( model, Dom.focus id |> Task.attempt FocusResult )
    ClearTerminal result ->
        case result of
            _ ->
              ( {model | results = (TermResult model.shellInput "" "~" "result") :: [], shellInput = "" }, sendCmd model.shellInput )
    SwitchState newState ->
        case newState of
            Ok stateRes ->
              ( {model | state = stateRes, results = (TermResult model.shellInput "" "~" "result") :: [], shellInput = "" }, sendCmd model.shellInput )
            Err _ ->
              model ! []
    FocusResult result ->
        case result of
            Err (Dom.NotFound id) ->
              model ! []
            Ok () ->
              model ! []

-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.batch [
    Time.every second Tick,
    gameResult GameResult
    ]

-- Api call for Term mode
createReq model =
  let
    url =
      "https://rraf9hlzlc.execute-api.us-east-1.amazonaws.com/dev/"
    post =
      Json.Encode.object
        [ ("command", Json.Encode.string model.shellInput),
          ("token", Json.Encode.string model.token)
        ]
    data =
      jsonBody post
    headers =
      [ Http.header "content-type" "application/json" ]
  in
    request
        { method = "POST"
        , headers = headers
        , url = url
        , body = data
        , expect = expectJson createResultDecoder
        , timeout = Nothing
        , withCredentials = False
        }

createPost : Model -> Cmd Msg
createPost model =
  case model.shellInput of
    "clear" ->
      Task.attempt ClearTerminal <| Task.succeed model.shellInput
    "game" ->
      Task.attempt SwitchState <| Task.succeed Game
    _ ->
      Http.send PostCreated (createReq model)

runGameAction : Model -> Cmd Msg
runGameAction model =
  case model.shellInput of
    "quit" ->
      Task.attempt SwitchState <| Task.succeed Term
    "exit" ->
      Task.attempt SwitchState <| Task.succeed Term
    _ ->
      sendGameCmd model.shellInput


runAction : Model -> Cmd Msg
runAction model =
  case model.state of
    Term ->
      createPost model
    Game ->
      runGameAction model

-- PORTS
port sendCmd : String -> Cmd msg

port sendGameCmd : String -> Cmd msg

port gameResult : (String -> msg) -> Sub msg

-- VIEW
viewGame : Model -> Html Msg
viewGame model =
  let
    buildResultItem entry =
      div [ class <| "entryItem " ++ entry.resType ] [
        div [] [
          div [ class "term-shellname" ] [ text ">" ]
        , div [ class "term-input-text"] [ text entry.command ]
        ]
      , div [ class "result term-input-text", property "innerHTML" (Json.Encode.string entry.result)  ] [ ]
      ]

    resultItems =  List.reverse model.results |> List.map buildResultItem

  in
    div [ onClick (FocusOn "hiddenShellInput") ] [
        div [] [
          div [ class "entries" ] resultItems
        , Html.form [ class "term", onSubmit RunAction] [
            div [ class "term-shellname" ] [ text "~" ]
          , input 
            [
              class "term-input"
            , Html.Attributes.value model.shellInput
            , onInput UpdateInput
            , id "hiddenShellInput"
            ] []
          , div [ class "term-input-text"] [ text model.shellInput ]
          , div [ class "term-cursor", property "innerHTML" (Json.Encode.string "&#9608;")  ] [ ]
          ]
        ]
      ]

viewShell : Model -> Html Msg
viewShell model =
  let
    buildResultItem entry =
      div [ class <| "entryItem " ++ entry.resType ] [
        div [] [
          div [ class "term-shellname" ] [ text "/bin/sh ~" ]
        , div [ class "term-input-text"] [ text entry.command ]
        ]
      , div [ class "result term-result-text", property "innerHTML" (Json.Encode.string entry.result)  ] [ ]
      ]

    resultItems =  List.reverse model.results |> List.map buildResultItem

  in
    div [ onClick (FocusOn "hiddenShellInput") ] [
        div [] [
          div [ class "entries" ] resultItems
        , Html.form [ class "term", onSubmit RunAction] [
            div [ class "term-shellname" ] [ text "/bin/sh ~" ]
          , input 
            [
              class "term-input"
            , Html.Attributes.value model.shellInput
            , onInput UpdateInput
            , id "hiddenShellInput"
            ] []
          , div [ class "term-input-text"] [ text model.shellInput ]
          , div [ class "term-cursor", property "innerHTML" (Json.Encode.string "&#9608;")  ] [ ]
          ]
        ]
      ]


view : Model -> Html Msg
view model =
  case model.state of
    Game ->
      viewGame model
    Term ->
      viewShell model
