import Store from "../lib/Store";
import initialState from "./initialState";
import reducer from "./reducer";


export default function () {
  return new Store(initialState, reducer);
}
