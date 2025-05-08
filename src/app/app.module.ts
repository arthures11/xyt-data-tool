import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import {OrderBookChartComponent} from "./components/order-book-chart/order-book-chart.component";
import {TimeNavigationComponent} from "./components/time-navigation/time-navigation.component";
import {FormsModule} from "@angular/forms";
import { HttpClientModule } from '@angular/common/http';


@NgModule({
    declarations: [
        AppComponent,
        OrderBookChartComponent,
        TimeNavigationComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        FormsModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
