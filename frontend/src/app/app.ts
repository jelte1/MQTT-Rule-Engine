import {Component, inject, OnInit, signal} from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {toSignal} from '@angular/core/rxjs-interop';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {map} from 'rxjs';
import {AuthService} from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, RouterLink,
    MatToolbarModule, MatSidenavModule,
    MatListModule, MatIconModule,
    MatButtonModule, MatTooltip, RouterLinkActive
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App implements OnInit {
  protected readonly title = signal('frontend');

  navItems = [
    { label: 'Dashboard', icon: 'home', route: '/dashboard' },
    { label: 'MQTT Connections', icon: 'cable', route: '/mqttconnections' },
    { label: 'Devices', icon: 'devices', route: '/devices' },
    { label: 'Topics', icon: 'folder', route: '/topics' },
    { label: 'Rules', icon: 'rule', route: '/rules' },
    { label: 'Variables', icon: 'tune', route: '/variables' },
    { label: 'Sensor Data', icon: 'data_object', route: '/sensordata' },
    { label: 'Sent Data', icon: 'send', route: '/sentdata' },
  ];

  private breakpointObserver = inject(BreakpointObserver);
  private authService = inject(AuthService);
  private router = inject(Router);

  sidenavOpened = signal(true);
  isMobile = toSignal(
    this.breakpointObserver.observe(Breakpoints.Handset).pipe(
      map(result => result.matches)
    ),
    { initialValue: false }
  );
  isLoggedIn = this.authService.isLoggedInVar;

  toggleSidenav() {
    this.sidenavOpened.set(!this.sidenavOpened());
  }

  ngOnInit() {
    if (this.isMobile()) {
      this.sidenavOpened.set(false);
    }
  }

  logout(): void {
    this.authService.logout();
    this.sidenavOpened.set(false);
    this.router.navigate(['/login']);
  }

}
