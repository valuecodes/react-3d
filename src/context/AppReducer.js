export default (state,action)=>{
    switch(action.type){
        case 'MODIFY_OPTIONS':
            return{
                ...state,
                options:action.payload.data
            }

        default:
            return state
    }
}