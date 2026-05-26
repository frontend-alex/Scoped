from abc import ABC, abstractmethod


class IDashboardRepository(ABC):
    @abstractmethod
    def create_analysis(self, analysis_data: dict):
        pass

    @abstractmethod
    def update_analysis(self, analysis_id: int, update_data: dict):
        pass

    @abstractmethod
    def get_analysis_by_id(self, analysis_id: int):
        pass

    @abstractmethod
    def get_user_history(self, user_id: str):
        pass