# Redux Funky Thunk

Converts functions with this signature

```
const action = ({ dispatch, getState, /* dependencies */ }) => payload => {}
```

to this signature for use as Redux thunks

```
const action = payload => (dispatch, getState, extraArguments) => {}
```

## Why

Using the dependencies-first signature makes it easier to compose actions together, like so.

```
const compositeAction = deps => pipeP(
  action1(deps),
  action2(deps)
);
```
