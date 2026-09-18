package com.example.progetto_ecommerce_v3.Controller;

import com.example.progetto_ecommerce_v3.Message;
import com.example.progetto_ecommerce_v3.Model.CollegamentiModel;
import com.example.progetto_ecommerce_v3.View.SceneHandler;
import com.example.progetto_ecommerce_v3.service.UtenteService;
import com.example.progetto_ecommerce_v3.Database.SessionManager;
import javafx.application.Platform;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyCodeCombination;
import javafx.scene.input.KeyCombination;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.BorderPane;

public class RegistrazioneController {

    private final UtenteService utenteService = new UtenteService();

    @FXML
    private BorderPane borderpane;

    @FXML
    private TextField cognomeField;

    @FXML
    private PasswordField confermaPasswordField;

    @FXML
    private TextField emailField;

    @FXML
    private TextField nomeField;

    @FXML
    private PasswordField passwordField;

    @FXML
    private Button registratiButton;

    @FXML
    void initialize() {
        borderpane.setOnKeyPressed(event -> {
            if (event.getCode() == KeyCode.ENTER) {
                registratiButton.fire(); // Simula un click sul pulsante
            }
        });

        aggiungiScorciatoieTastiera();

        Platform.runLater(() -> {
            borderpane.requestFocus();
        });
    }

    @FXML
    void RegistratiAction(ActionEvent event) {
        String nome = nomeField.getText();
        String cognome = cognomeField.getText();
        String email = emailField.getText();
        String pass = passwordField.getText();
        String confPass = confermaPasswordField.getText();

        // 1. VALIDAZIONE LOCALE
        // Controlliamo se i campi sono vuoti o le password diverse
        if (nome.isEmpty() || cognome.isEmpty() || email.isEmpty() || pass.isEmpty() || confPass.isEmpty()) {
            SceneHandler.getInstance().Errore("Compila tutti i campi!");
            return;
        }

        if (!pass.equals(confPass)) {
            SceneHandler.getInstance().Errore("Le password non coincidono!");
            return;
        }

        // 2. CHIAMATA AL SERVICE (Passiamo solo i 4 dati che servono al backend)
        utenteService.registrazione(nome, cognome, email, pass)
                .thenAccept(risultato -> {
                    Platform.runLater(() -> {
                        if (risultato != null) {
                            try {
                                // Effettuiamo il Login automatico nella sessione (utente + token JWT)
                                SessionManager.getInstance().Login(risultato.utente(), risultato.token());
                                System.out.println("Registrazione OK: " + risultato.utente().Email());

                                // Andiamo alla Home
                                SceneHandler.getInstance().loadHomeWindow();
                            } catch (Exception e) {
                                e.printStackTrace();
                                SceneHandler.getInstance().Errore(Message.Errore_Generico);
                            }
                        } else {
                            // Fallimento se l'utente è null o già registrato
                            SceneHandler.getInstance().Errore("Registrazione fallita. Email già in uso?");
                        }
                    });
                })
                .exceptionally(e -> {
                    Platform.runLater(() -> {
                        e.printStackTrace();
                        SceneHandler.getInstance().Errore("Errore di connessione al server");
                    });
                    return null;
                });
    }

    private void aggiungiScorciatoieTastiera() {
        borderpane.sceneProperty().addListener((observable, oldScene, newScene) -> {
            if (newScene != null) {
                newScene.setOnKeyPressed(event -> {
                    if (new KeyCodeCombination(KeyCode.H, KeyCombination.CONTROL_DOWN).match(event)) {
                        SceneHandler.getInstance().loadHomeWindow();
                    }
                    if (new KeyCodeCombination(KeyCode.L, KeyCombination.CONTROL_DOWN).match(event)) {
                        SceneHandler.getInstance().loadLoginWindow();
                    }
                    if (new KeyCodeCombination(KeyCode.C, KeyCombination.CONTROL_DOWN).match(event)) {
                        SceneHandler.getInstance().loadCarrelloWindow();
                    }
                });
            }
        });
    }

    void caricahome() {
        try {
            SceneHandler.getInstance().loadHomeWindow();
        } catch (Exception e) {
            SceneHandler.getInstance().Errore(Message.Errore_Home);
        }
    }

    @FXML
    void instaClicked(MouseEvent event) {
        try {
            CollegamentiModel.collegamentiSocial("https://www.instagram.com/accounts/login/");
        } catch (Exception e) {
            SceneHandler.getInstance().Errore(Message.Errore_Nel_Caricamento_Della_Pagina_Instagram);
            caricahome();
        }
    }

    @FXML
    void twitterClicked(MouseEvent event) {
        try {
            CollegamentiModel.collegamentiSocial("https://x.com/i/flow/login?input_flow_data=%7B%22requested_variant%22%3A%22eyJsYW5nIjoiaXQiLCJteCI6IjIifQ%3D%3D%22%7D");
        } catch (Exception e) {
            SceneHandler.getInstance().Errore(Message.Errore_Nel_Caricamento_Della_Pagina_Twitter);
            caricahome();
        }
    }

    @FXML
    void facebookClicked(MouseEvent event) {
        try {
            CollegamentiModel.collegamentiSocial("https://m.facebook.com/login/?locale=it_IT");
        } catch (Exception e) {
            SceneHandler.getInstance().Errore(Message.Errore_Nel_Caricamento_Della_Pagina_Facebook);
            caricahome();
        }
    }

    @FXML
    void chisiamoClicked(MouseEvent event) {
        try {
            SceneHandler.getInstance().loadchisiamonoi();
        } catch (Exception e) {
            SceneHandler.getInstance().Errore(Message.Errore_Caricamento_Pagina_Chi_Siamo_Noi);
            caricahome();
        }
    }

    @FXML
    void infoClicked(MouseEvent event) {
        try {
            SceneHandler.getInstance().loadinfoeprivacy();
        } catch (Exception e) {
            SceneHandler.getInstance().Errore(Message.Errore_Caricamento_Pagina_Info_E_Privacy);
            caricahome();
        }
    }

    @FXML
    void loadHome(MouseEvent event) {
        caricahome();
    }
}