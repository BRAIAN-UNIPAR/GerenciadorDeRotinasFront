import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

export function ProtectRoute({children}){
    
    const { user } = useAuth()

    if(!user){
        return <Navigate to="/"/>
    }

    return children

}