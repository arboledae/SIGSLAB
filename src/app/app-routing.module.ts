import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DocenteComponent } from './components/docente/docente.component';
import { DocenteHistorialComponent } from './components/docente-historial/docente-historial.component';
import { JefeDashboardComponent } from './components/jefe-dashboard/jefe-dashboard.component';
import { TecnicoComponent } from './components/tecnico/tecnico.component';
import { TecnicoHistorialComponent } from './components/tecnico-historial/tecnico-historial.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'docente', component: DocenteComponent, canActivate: [AuthGuard], data: { role: 'docente' } },
  { path: 'docente/historial', component: DocenteHistorialComponent, canActivate: [AuthGuard], data: { role: 'docente' } },
  { path: 'jefe', component: JefeDashboardComponent, canActivate: [AuthGuard], data: { role: 'jefe-soporte' } },
  { path: 'tecnico', component: TecnicoComponent, canActivate: [AuthGuard], data: { role: 'tecnico' } },
  { path: 'tecnico/historial', component: TecnicoHistorialComponent, canActivate: [AuthGuard], data: { role: 'tecnico' } },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
