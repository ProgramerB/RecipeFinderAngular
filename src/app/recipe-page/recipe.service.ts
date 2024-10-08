import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, tap, throwError } from "rxjs";
import { ProgressBarService } from "../shared/progress-bar.service";
import { meals } from "./meal";
import { nutrition, recipe } from "./recipe";
import { environment } from "../../environments/environment.development";

const mealDBUrl = environment.envVar.springUrl+'/api/mealDB'
const spoonacularUrl =environment.envVar.springUrl+"/api/spoonacular"

@Injectable({
    providedIn:'root'
})
export class RecipeService{

    constructor(private http:HttpClient, private progressBarService: ProgressBarService){}

    getRecipes(): Observable<meals>{
        this.progressBarService.startLoading();
        return this.http.get<meals>(mealDBUrl+"/random").pipe(
            // tap( data => console.log('ALL',JSON.stringify(data))),
            catchError(this.handleError)
        );
    }

    //search
    getRecipesByName(name:string): Observable<meals>{
        this.progressBarService.startLoading();
        return this.http.get<meals>(mealDBUrl+"/search?name="+name).pipe(
            tap( data => {
                // console.log('search for '+name,JSON.stringify(data));
                this.progressBarService.stopLoading();
                this.progressBarService.setSuccess();
            }),
            catchError(this.handleError)
            
        );
        
    }

    getRecipeById(id:number): Observable<meals>{
        return this.http.get<meals>(mealDBUrl+"/lookup?id="+id).pipe(
            // tap( data => console.log('lookup for '+id,JSON.stringify(data))),
            catchError(this.handleError)
        );
    }

    getRecipesByData(type:string,name:string): Observable<meals>{
        this.progressBarService.startLoading();
        return this.http.get<meals>(mealDBUrl+"/filter/"+type+"?name="+name).pipe(
            tap( data => {
                // console.log('filter for '+name,JSON.stringify(data));
                this.progressBarService.stopLoading();
                this.progressBarService.setSuccess();
            }),
            catchError(this.handleError)
        );
    }

    getNutritionByName(name:string): Observable<nutrition>{
        this.progressBarService.startLoading();
        return this.http.get<nutrition>(spoonacularUrl+"/guessNutrition?name="+name).pipe(
            tap( data => {
                // console.log('nutrition for '+name,JSON.stringify(data));
                this.progressBarService.stopLoading();
                if(data){
                    this.progressBarService.setSuccess();
                }else{
                    this.progressBarService.setError();
                }
                
            }),
            catchError(this.handleError)
            
        );
    }


    private handleError( err:HttpErrorResponse ){
        this.progressBarService.stopLoading();
        let errorMessage = '';
        if(err.error instanceof ErrorEvent){
            //client side error
            errorMessage = `An error occured: ${err.message}`;
        }
        else{
            //server side error
            errorMessage = `Server return code: ${err.status}, error message is ${err.message}`;
        }
        console.error(errorMessage);
        return throwError(()=>errorMessage);
    }
}