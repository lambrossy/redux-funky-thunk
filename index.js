const dispatchAction = dispatch => type => payload =>
  dispatch(Object.assign({ type }, payload && { payload })) &&
  Promise.resolve(payload);

const dispatchError = (dispatch, payload) => type => error =>
  dispatch(
    Object.assign({ type }, error && { error }, payload && { payload })
  ) && Promise.reject(payload);

const funky = thunk =>
  typeof thunk === "function"
    ? payload => (dispatch, getState, extraArguments) =>
        thunk({
          dispatch,
          getState,
          ...extraArguments,
          dispatchAction: dispatchAction(dispatch),
          dispatchError: dispatchError(dispatch, payload)
        })(payload)
    : Object.keys(thunk).reduce(
        (accum, key) => Object.assign(accum, { [key]: funky(thunk[key]) }),
        {}
      );

module.exports = funky;
