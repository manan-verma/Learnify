import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({children}) => {
    const {isAuthenticated} = useSelector(store=>store.auth);

    if(!isAuthenticated){
        return <Navigate to="/login"/>
    }

    return children;
}

export const AuthenicatedUser = ({children})=>{
    const {isAuthenticated} = useSelector(store=>store.auth);

    if(isAuthenticated){
        return <Navigate to="/"/>
    }

    return children;
}

//koi student admin portal na access kr paye 
export const AdminRoute = ({children})=>{
    const {user, isAuthenticated} = useSelector(store=>store.auth);
    if(!isAuthenticated){
        return <Navigate to="/login" />
    }

    if(user?.role !== "instructor"){
        return <Navigate to="/" />
    }
    return children;
}