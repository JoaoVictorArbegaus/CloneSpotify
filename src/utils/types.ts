// Tipos globais usados no app

export type User = {
  id: string;
  email: string;
  name?: string;
};

export type Track = {
  id: string;            // idTrack
  nome: string;          // strTrack
  artista: string;       // strArtist
  genero?: string;       // strGenre
  ano?: string | number; // intYearReleased
  album?: string;        // strAlbum
  previewUrl?: string;
  thumbUrl?: string;     // strTrackThumb
};

export type Playlist = {
  id: string;
  nome: string;
  usuarioId: string; // dono
  musicas: Track[];
  createdAt: number;
  updatedAt: number;
};
