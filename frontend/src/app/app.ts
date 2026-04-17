import {Component, inject, OnInit, signal} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {toSignal} from '@angular/core/rxjs-interop';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {map} from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule, MatTooltip
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App implements OnInit {
  protected readonly title = signal('frontend');

  navItems = [
    { label: 'Dashboard', icon: 'home', route: '/home' },
    { label: 'MQTT Connections', icon: 'cable', route: '/mqttconnections' },
    { label: 'Devices', icon: 'devices', route: '/devices' },
    { label: 'Topics', icon: 'folder', route: '/topics' },
    { label: 'Rules', icon: 'rule', route: '/rules' },
  ];

  private breakpointObserver = inject(BreakpointObserver);

  sidenavOpened = signal(true);

  isMobile = toSignal(
    this.breakpointObserver.observe(Breakpoints.Handset).pipe(
      map(result => result.matches)
    ),
    { initialValue: false }
  );

  toggleSidenav() {
    this.sidenavOpened.set(!this.sidenavOpened());
  }

  ngOnInit() {
    if (this.isMobile()) {
      this.sidenavOpened.set(false);
    }
  }
}
