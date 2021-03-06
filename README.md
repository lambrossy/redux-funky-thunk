# Redux Funky Thunk

Converts functions with this signature

```
const action = ({ dispatch, getState, ...extraArguments }) => payload => {}
```

to this signature for use as Redux thunks

```
const action = payload => (dispatch, getState, extraArguments) => {}
```

## Installation

```
npm i -S redux-funky-thunk
```

## Why

Using the dependencies-first signature makes it easier to compose actions together, like so.

```
const compositeAction = deps => pipeP(
  action1(deps),
  action2(deps)
);
```

## Example actions

```
import { pipeP, objOf, merge, always, invoker, identity } from "ramda";

const postUser = ({ fetch, dispatchAction, dispatchError }) => payload =>
  Promise.resolve(payload)
    .then(dispatchAction("POST_USER"))
    .then(JSON.stringify)
    .then(objOf("body"))
    .then(merge({ method: "POST" }))
    .then(fetch("https://jsonplaceholder.typicode.com/users"))
    .then(invoker(0, "json"))
    .then(dispatchAction("POST_USER_SUCCESS"));

const getUser = ({ fetch, dispatchAction, dispatchError }) => payload =>
  Promise.resolve(payload)
    .then(dispatchAction("GET_USER"))
    .then(always({}))
    .then(fetch(`https://jsonplaceholder.typicode.com/users/${payload.id}`))
    .then(invoker(0, "json"))
    .then(dispatchAction("GET_USER_SUCCESS"));

const postGetUser = deps =>
  pipeP(
    postUser(deps),
    getUser(deps)
  );
```

Such actions can be consumed by connected components as follows.

```
const mapDispatchToProps = funky({
  getUser,
  postUser,
  postGetUser
});

// or

const mapDispatchToProps = {
  getUser: funky(getUser),
  postUser: funky(postUser),
  postGetUser: funky(postGetUser)
}
```

## Dispatch helpers

Two helpers (`dispatchAction`, `dispatchError`) are provided to make funky-thunks that dispatch actions less verbose.

```
// instead of this
const dispatchTheSameActionTwice = ({ dispatch }) => payload =>
  Promise.resolve(payload)
    .then(payload => ({ type: 'TYPE', payload }))
    .then(dispatch)
    .then(action => action.payload)
    .then(payload => ({ type: 'TYPE', payload }))
    .then(dispatch);

// you can do this
const dispatchTheSameActionTwice = ({ dispatchAction, dispatchError }) => payload =>
  Promise.resolve(payload)
    .then(dispatchAction('TYPE'), dispatchError('ERROR'))
    .then(dispatchAction('TYPE'), dispatchError('ERROR'));
```

These helpers use `dispatch` internally to dispatch the action, but then return either a `resolved` or `rejected` payload, so you can continue chaining.

`dispatchError` will also include an `error` property on the action object.

## Side-effects

Side-effect producing dependencies should be passed in as extra arguments to redux-thunk. It is often useful to curry these functions to allow a `railway-oriented` programming style. Use an auto-curried functional toolbelt like ramda or lodash/fp for maximum style points.

```
const store = createStore(
  reducer,
  startingState,
  applyMiddleware(
    thunk.withExtraArgument({
      fetch: url => options => window.fetch(url, options)
    })
  )
);

const doFetch = ({ fetch }) => payload =>
  Promise.resolve(payload)
    .then(JSON.stringify)
    .then(objOf("body"))
    .then(merge({ method: "POST" }))
    .then(fetch("https://jsonplaceholder.typicode.com/users"));
```
