import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { DocenteComponent } from './components/docente/docente.component';
import { DocenteHistorialComponent } from './components/docente-historial/docente-historial.component';
import { JefeDashboardComponent } from './components/jefe-dashboard/jefe-dashboard.component';
import { TecnicoComponent } from './components/tecnico/tecnico.component';
import { TecnicoHistorialComponent } from './components/tecnico-historial/tecnico-historial.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DocenteComponent,
    DocenteHistorialComponent,
    JefeDashboardComponent,
    TecnicoComponent,
    TecnicoHistorialComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
