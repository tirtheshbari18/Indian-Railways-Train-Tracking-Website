export interface User {
  id: number;
  email: string;
  full_name?: string;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Platform {
  id: number;
  platform_number: string;
  length_meters?: number;
  has_escalator: boolean;
  has_lift: boolean;
  is_accessible: boolean;
}

export interface Station {
  id: number;
  code: string;
  name: string;
  hindi_name?: string;
  zone?: string;
  division?: string;
  state: string;
  latitude: number;
  longitude: number;
  number_of_platforms: number;
  station_category?: string;
  platforms?: Platform[];
  total_stopping_trains?: number;
  schedule_sample?: StationTimetableEntry[];
}

export interface StationAutocomplete {
  id: number;
  code: string;
  name: string;
  state: string;
  zone?: string;
}

export interface Train {
  id: number;
  train_number: string;
  train_name: string;
  train_category: string;
  source_station_id: number;
  destination_station_id: number;
  source_station: Station;
  destination_station: Station;
  departure_time: string;
  arrival_time: string;
  total_distance_km: number;
  total_duration_minutes: number;
  operating_days: string;
  rake_type: string;
  classes: string;
  average_speed_kmh: number;
  max_speed_kmh: number;
  punctuality_rating: number;
}

export interface TrainStop {
  id: number;
  stop_sequence: number;
  station: Station;
  scheduled_arrival?: string;
  scheduled_departure?: string;
  halt_minutes: number;
  distance_from_source_km: number;
  distance_from_previous_km?: number;
  day_number: number;
  platform_number?: string;
  speed_kmh?: number;
  latitude?: number;
  longitude?: number;
}

export interface TrainRouteDetail {
  train_number: string;
  train_name: string;
  category: string;
  source: { code: string; name: string; latitude: number; longitude: number };
  destination: { code: string; name: string; latitude: number; longitude: number };
  total_stops: number;
  total_distance_km: number;
  total_duration_minutes: number;
  stops: {
    sequence: number;
    station_code: string;
    station_name: string;
    hindi_name?: string;
    state: string;
    zone?: string;
    scheduled_arrival?: string;
    scheduled_departure?: string;
    halt_minutes: number;
    distance_from_source_km: number;
    distance_from_previous_km: number;
    day_number: number;
    platform_number?: string;
    latitude: number;
    longitude: number;
  }[];
  coordinates: [number, number][];
}

export interface StopLiveProgress {
  station_code: string;
  station_name: string;
  stop_sequence: number;
  scheduled_arrival?: string;
  scheduled_departure?: string;
  actual_arrival?: string;
  actual_departure?: string;
  delay_minutes: number;
  distance_km: number;
  day_number: number;
  platform_number?: string;
  status: 'DEPARTED' | 'ARRIVED' | 'CURRENT' | 'UPCOMING';
}

export interface LiveStatus {
  train_id: number;
  train_number: string;
  train_name: string;
  train_category: string;
  source_station: Station;
  destination_station: Station;
  status: string;
  delay_minutes: number;
  current_speed_kmh: number;
  distance_covered_km: number;
  distance_remaining_km: number;
  progress_percentage: number;
  current_station?: Station;
  last_reported_station?: Station;
  next_scheduled_station?: Station;
  current_latitude?: number;
  current_longitude?: number;
  scheduled_departure: string;
  scheduled_arrival: string;
  actual_departure?: string;
  actual_arrival?: string;
  data_source_type: 'LIVE_VERIFIED' | 'DEMO_DATA' | 'SCHEDULED_ESTIMATE';
  is_live_verified: boolean;
  data_source_name: string;
  last_updated: string;
  stops_timeline: StopLiveProgress[];
}

export interface StationTimetableEntry {
  train_number: string;
  train_name: string;
  train_category: string;
  source_name: string;
  source_code: string;
  destination_name: string;
  destination_code: string;
  scheduled_arrival?: string;
  scheduled_departure?: string;
  halt_minutes: number;
  platform_number?: string;
  delay_minutes: number;
  status: string;
}

export interface TrainMetricComparison {
  train: Train;
  total_stops: number;
  duration_formatted: string;
  average_speed_kmh: number;
  max_speed_kmh: number;
  punctuality_rating: number;
  classes_available: string[];
  operating_days_count: number;
  major_intermediate_stations: string[];
  typical_delay_minutes: number;
}

export interface TrainCompareResponse {
  trains: TrainMetricComparison[];
  fastest_train_number: string;
  least_stops_train_number: string;
  highest_punctuality_train_number: string;
}

export interface NetworkMapData {
  stations: {
    id: number;
    code: string;
    name: string;
    zone?: string;
    state: string;
    latitude: number;
    longitude: number;
    category?: string;
    platforms: number;
  }[];
  routes: {
    train_number: string;
    train_name: string;
    category: string;
    source_code: string;
    destination_code: string;
    coordinates: [number, number][];
  }[];
  live_trains: {
    train_number: string;
    train_name: string;
    category: string;
    latitude: number;
    longitude: number;
    speed_kmh: number;
    delay_minutes: number;
    status: string;
    progress_percentage: number;
  }[];
}

export interface Favourite {
  id: number;
  item_type: 'train' | 'station';
  train_id?: number;
  station_id?: number;
  train_number?: string;
  station_code?: string;
  title: string;
  subtitle: string;
  created_at: string;
}

export interface SearchHistoryItem {
  id: number;
  query_type: string;
  search_query: string;
  source_code?: string;
  destination_code?: string;
  created_at: string;
}

export interface DataSource {
  id: number;
  name: string;
  source_type: string;
  endpoint_url?: string;
  is_active: boolean;
  is_live_verified: boolean;
  last_sync_time?: string;
  sync_interval_seconds: number;
  status: string;
}

export interface SystemHealth {
  status: string;
  database: string;
  active_trains_count: number;
  active_stations_count: number;
  live_tracking_enabled: boolean;
  data_sources: DataSource[];
  server_time: string;
  uptime_seconds: number;
}

export interface AdminStats {
  total_trains: number;
  total_stations: number;
  total_users: number;
  total_running_updates: number;
  data_sources_count: number;
  recent_searches_count: number;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  user_email?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}
