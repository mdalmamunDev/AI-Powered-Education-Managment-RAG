import {state} from "./state";
import {getters} from "./getters";
import {mutations} from "./mutations";
import {actions} from "./actions";
import { createStore } from 'vuex';

const store = createStore({
    state,
    getters,
    mutations,
    actions
});

export default store;