import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonDatetime,
  IonItem,
  IonList,
  IonItemSliding,
  IonLabel,
  IonItemOption,
  IonIcon,
  IonItemOptions,
  IonModal,
  IonFab,
  IonFabButton,
  IonButton,
  IonButtons,
  IonInput,
  IonGrid,
  IonRow,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmark,
  createOutline,
  trashOutline,
  sad,
  add,
} from 'ionicons/icons';
import { AlertController } from '@ionic/angular';
import { Todo } from 'src/app/models/todo.model';
import { DatabaseService } from 'src/app/services/database.service';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonRow,
    IonGrid,
    IonInput,
    IonButtons,
    IonButton,
    IonFabButton,
    IonFab,
    IonModal,
    IonItemOptions,
    IonIcon,
    IonItemOption,
    IonLabel,
    IonItemSliding,
    IonList,
    IonItem,
    IonDatetime,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
  ],
})
export class HomePage {
  todos: Todo[] = [];
  createModel: Todo = new Todo();
  updateModel: Todo = new Todo();

  isCreateModalOpen: boolean = false;
  isUpdateModalOpen: boolean = false;

  minDate: string = new Date().toISOString();

  constructor(
    private database: DatabaseService,
    private alert: AlertController
  ) {
    addIcons({
      checkmark,
      createOutline,
      trashOutline,
      sad,
      add,
    });
  }

  async requestPermission() {
    const granted = await LocalNotifications.requestPermissions();
    if (granted) {
      console.log('Notification permission granted');
    } else {
      console.log('Notification permission denied');
    }
  }

  onDateChange(event: any, operation: string) {
    if (operation === 'create') {
      this.createModel.date = event.detail.value;
    } else if (operation === 'update') {
      this.updateModel.date = event.detail.value;
    }
  }

  loadTodos() {
    const loadedTodos = JSON.parse(localStorage.getItem('todos') || '[]');

    this.todos = loadedTodos.sort((a: Todo, b: Todo) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });
  }

  async addTodo(form: NgForm) {
    if (form.valid) {
      this.database.addTodo(this.createModel);
      this.scheduleNotification(this.createModel.title, this.createModel.date);

      form.resetForm();
      this.closeModal('create');
      this.loadTodos();

      const alert = await this.alert.create({
        header: 'Görev Başarıyla Eklendi!',
        animated: true,
        buttons: ['Tamam'],
      });

      await alert.present();
    }
  }

  getTodo(todo: Todo) {
    this.updateModel = { ...todo };
  }

  async updateTodo(form: NgForm) {
    if (form.valid) {
      this.database.updateTodo(this.updateModel);
      this.scheduleNotification(this.updateModel.title, this.updateModel.date);

      form.resetForm();
      this.closeModal('update');
      this.loadTodos();

      const alert = await this.alert.create({
        header: 'Görev Başarıyla Güncellendi!',
        animated: true,
        buttons: ['Tamam'],
      });

      await alert.present();
    }
  }

  async deleteTodo(id: string) {
    const alert = await this.alert.create({
      header: 'Görevi silmek istediğinize emin misiniz?',
      animated: true,
      buttons: [
        {
          text: 'Vazgeç',
          role: 'cancel',
        },
        {
          text: 'Sil',
          handler: () => {
            this.database.deleteTodo(id);
            this.loadTodos();
          },
        },
      ],
    });

    await (await alert).present();
  }

  async completeTodo(id: string) {
    const alert = await this.alert.create({
      header: 'Görevi tamamladınız mı?',
      animated: true,
      buttons: [
        {
          text: 'Hayır',
          role: 'cancel',
        },
        {
          text: 'Evet',
          handler: () => {
            this.database.deleteTodo(id);
            this.loadTodos();
          },
        },
      ],
    });

    await alert.present();
  }

  openModal(operation: string) {
    if (operation === 'create') {
      this.isCreateModalOpen = true;
    } else if (operation === 'update') {
      this.isUpdateModalOpen = true;
    }
  }

  closeModal(operation: string) {
    if (operation === 'create') {
      this.isCreateModalOpen = false;
    } else if (operation === 'update') {
      this.isUpdateModalOpen = false;
    }
  }

  isPastDue(todoDate: string): boolean {
    const currentDate = new Date();
    const todoDateObj = new Date(todoDate);
    return todoDateObj < currentDate;
  }

  async scheduleNotification(todoTitle: string, todoDate: string) {
    const notificationId = new Date().getTime();

    await LocalNotifications.schedule({
      notifications: [
        {
          id: notificationId,
          title: 'Görev Hatırlatıcı',
          body: `Görev zamanı geldi: ${todoTitle}`,
          schedule: {
            at: new Date(todoDate),
          },
          sound: undefined,
          attachments: undefined,
          actionTypeId: '',
          extra: null,
        },
      ],
    });
  }
}
