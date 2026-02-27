 import { TestBed } from '@angular/core/testing';
 import { provideHttpClient } from '@angular/common/http';
 import { SessionService } from './user.service';
 
+describe('SessionService', () => {
  let service: SessionService;
 
   beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(SessionService);
   });
 
   it('should be created', () => {
     expect(service).toBeTruthy();
   });
 });
